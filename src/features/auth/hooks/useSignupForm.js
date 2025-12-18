import React from 'react'
import { sendEmailVerificationCode, verifyEmailVerificationCode, signup } from '../../../services/authService'

/**
 * 회원가입 폼 관리를 위한 커스텀 훅
 * 
 * @param {Function} onComplete - 역할 선택 완료 시 호출되는 콜백 함수
 *                                파라미터: selectedRole (string)
 * @param {Object} notification - Notification 훅 인스턴스 (선택사항)
 * 
 * @returns {Object} 회원가입 폼 상태, 에러, 핸들러, 역할 목록
 */
export default function useSignupForm(onComplete, notification = null) {
  // 사용자 이름 입력 상태
  const [name, setName] = React.useState('')
  
  // 이메일 입력 상태
  const [signupEmail, setSignupEmail] = React.useState('')
  
  // 비밀번호 입력 상태
  const [signupPassword, setSignupPassword] = React.useState('')
  
  // 비밀번호 확인 입력 상태
  const [confirmPassword, setConfirmPassword] = React.useState('')
  
  // 이용약관 동의 상태
  const [agreeTerms, setAgreeTerms] = React.useState(false)
  
  // 개인정보 처리방침 동의 상태
  const [agreePrivacy, setAgreePrivacy] = React.useState(false)
  
  // 이용약관 모달 열림 상태
  const [openTermsModal, setOpenTermsModal] = React.useState(false)
  
  // 개인정보 처리방침 모달 열림 상태
  const [openPrivacyModal, setOpenPrivacyModal] = React.useState(false)
  
  // 선택된 역할
  const [selectedRole, setSelectedRole] = React.useState('')
  
  // 이메일 인증 코드 입력 상태
  const [emailVerificationCode, setEmailVerificationCode] = React.useState('')
  
  // 이메일 인증 코드 발송 로딩 상태
  const [sendingCode, setSendingCode] = React.useState(false)
  
  // 이메일 인증 코드 검증 로딩 상태
  const [verifyingCode, setVerifyingCode] = React.useState(false)
  
  // 이메일 인증 코드 검증 완료 상태
  const [emailVerified, setEmailVerified] = React.useState(false)
  
  // 회원가입 로딩 상태
  const [signupLoading, setSignupLoading] = React.useState(false)
  
  
  // 각 필드별 에러 메시지 상태
  const [errors, setErrors] = React.useState({
    name: '',
    email: '',
    emailVerificationCode: '',
    password: '',
    confirmPassword: '',
    role: ''
  })

  /**
   * 비밀번호 검증 (백엔드에서 검증하므로 최소한의 UX 검증만)
   * @param {string} value - 비밀번호 값
   * @returns {string} 에러 메시지 (유효하면 빈 문자열)
   */
  const validatePassword = (value) => {
    if (!value) {
      return '비밀번호를 입력해주세요.'
    }
    if (value.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다.'
    }
    // 영문자와 숫자 모두 포함하는지 확인
    const hasLetter = /[A-Za-z]/.test(value)
    const hasNumber = /\d/.test(value)
    if (!hasLetter || !hasNumber) {
      return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.'
    }
    return ''
  }

  /**
   * 이름 입력 변경 핸들러
   * 입력값을 업데이트하고 실시간으로 유효성 검증 수행
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleNameChange = (event) => {
    const value = event.target.value
    setName(value)
    setErrors((prev) => ({ ...prev, name: '' }))
  }

  /**
   * 이메일 입력 변경 핸들러
   * 입력값을 업데이트하고 실시간으로 유효성 검증 수행
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleEmailChange = (event) => {
    const value = event.target.value
    setSignupEmail(value)
    setErrors((prev) => ({ ...prev, email: '' }))
  }

  /**
   * 비밀번호 입력 변경 핸들러
   * 입력값을 업데이트하고 실시간으로 유효성 검증 수행
   * 비밀번호 확인 값이 이미 입력되어 있다면 함께 재검증
   * @param {Event} event - 입력 이벤트 객체
   */
  const handlePasswordChange = (event) => {
    const value = event.target.value
    setSignupPassword(value)
    const passwordError = validatePassword(value)
    setErrors((prev) => ({ ...prev, password: passwordError }))
    // 비밀번호가 변경되면 비밀번호 확인도 재검증
    if (confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }))
    }
  }

  /**
   * 비밀번호 확인 입력 변경 핸들러
   * 입력값을 업데이트하고 실시간으로 유효성 검증 수행
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value
    setConfirmPassword(value)
    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
  }

  /**
   * 직무 입력 변경 핸들러
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleRoleChange = (event) => {
    const value = event.target.value
    setSelectedRole(value)
    setErrors((prev) => ({ ...prev, role: '' }))
  }

  /**
   * 이메일 인증 코드 입력 변경 핸들러
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleEmailVerificationCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, '') // 숫자만 허용
    if (value.length <= 6) {
      setEmailVerificationCode(value)
      setErrors((prev) => ({ ...prev, emailVerificationCode: '' }))
    }
  }

  /**
   * 이메일 인증 코드 발송 핸들러
   */
  const handleSendVerificationCode = async () => {
    // 백엔드에서 검증하므로 프론트엔드에서는 빈 값만 체크
    if (!signupEmail) {
      setErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요.' }))
      return
    }

    setSendingCode(true)
    setErrors((prev) => ({ ...prev, email: '' }))

    try {
      await sendEmailVerificationCode(signupEmail)
      alert('인증 코드가 발송되었습니다. 이메일을 확인해주세요.')
      // 인증 코드 발송 후 검증 상태 초기화
      setEmailVerified(false)
      setEmailVerificationCode('')
      setErrors((prev) => ({ ...prev, emailVerificationCode: '' }))
    } catch (error) {
      // 백엔드 에러 메시지를 그대로 표시
      const errorMessage = error.message || '인증 코드 발송에 실패했습니다.'
      setErrors((prev) => ({ ...prev, email: errorMessage }))
    } finally {
      setSendingCode(false)
    }
  }

  /**
   * 이메일 인증 코드 검증 핸들러
   */
  const handleVerifyCode = async () => {
    // 백엔드에서 검증하므로 프론트엔드에서는 빈 값만 체크
    if (!signupEmail) {
      setErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요.' }))
      return
    }

    if (!emailVerificationCode || emailVerificationCode.length !== 6) {
      setErrors((prev) => ({ ...prev, emailVerificationCode: '인증 코드 6자리를 입력해주세요.' }))
      return
    }

    setVerifyingCode(true)
    setErrors((prev) => ({ ...prev, emailVerificationCode: '' }))

    try {
      await verifyEmailVerificationCode(signupEmail, emailVerificationCode)
      setEmailVerified(true)
      alert('인증 코드가 확인되었습니다.')
    } catch (error) {
      // 백엔드 에러 메시지를 그대로 표시
      const errorMessage = error.message || '인증 코드 확인에 실패했습니다.'
      setErrors((prev) => ({ ...prev, emailVerificationCode: errorMessage }))
      setEmailVerified(false)
    } finally {
      setVerifyingCode(false)
    }
  }

  /**
   * 전체 폼 검증 (백엔드에서 검증하므로 최소한의 필수값만 체크)
   * @returns {boolean} 검증 통과 여부
   */
  const validateForm = () => {
    // 필수 필드 검증
    if (!name) {
      setErrors((prev) => ({ ...prev, name: '이름을 입력해주세요.' }))
      return false
    }
    if (!signupEmail) {
      setErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요.' }))
      return false
    }
    
    // 비밀번호 검증
    const passwordError = validatePassword(signupPassword)
    if (passwordError) {
      setErrors((prev) => ({ ...prev, password: passwordError }))
      return false
    }
    
    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '비밀번호 확인을 입력해주세요.' }))
      return false
    }
    
    if (signupPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }))
      return false
    }
    
    if (!selectedRole) {
      setErrors((prev) => ({ ...prev, role: '직무를 입력해주세요.' }))
      return false
    }

    // 약관 동의 검증 (백엔드에서도 검증하지만 UX를 위해 프론트에서도 체크)
    if (!agreeTerms) {
      alert('서비스 이용 약관에 동의해주세요.')
      return false
    }
    if (!agreePrivacy) {
      alert('개인정보 수집 및 이용에 동의해주세요.')
      return false
    }

    return true
  }

  /**
   * 회원가입 핸들러
   */
  const handleSignup = async () => {
    // 폼 검증
    if (!validateForm()) {
      return
    }

    setSignupLoading(true)

    try {
      const response = await signup({
        name,
        email: signupEmail,
        password: signupPassword,
        passwordConfirm: confirmPassword,
        agreeToTerms: agreeTerms,
        agreeToPrivacy: agreePrivacy,
        jobRole: selectedRole
      })

      // 성공 메시지 표시
      if (notification) {
        notification.showSuccess('회원가입에 성공했습니다.')
      }
      
      // 토큰은 authService.signup()에서 이미 저장됨 (중복 저장 제거)

      // 성공 후 콜백 호출 (로그인 페이지로 이동)
      if (onComplete) {
        setTimeout(() => {
          onComplete(selectedRole)
        }, 1500) // 1.5초 후 이동
      }
    } catch (error) {
      // 백엔드 에러 메시지를 그대로 표시
      const errorMessage = error.message || '회원가입에 실패했습니다.'
      if (notification) {
        notification.showError(errorMessage)
      } else {
      alert(errorMessage)
      }
      
      // 백엔드 검증 에러를 필드별로 표시 (백엔드 응답 구조에 따라 조정 필요)
      // 현재는 alert로만 표시하고, 필요시 백엔드 응답 구조를 확인하여 필드별 에러 매핑
    } finally {
      setSignupLoading(false)
    }
  }

  return {
    name,
    signupEmail,
    signupPassword,
    confirmPassword,
    emailVerificationCode,
    agreeTerms,
    agreePrivacy,
    openTermsModal,
    openPrivacyModal,
    selectedRole,
    errors,
    sendingCode,
    verifyingCode,
    emailVerified,
    signupLoading,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleEmailVerificationCodeChange,
    handleSendVerificationCode,
    handleVerifyCode,
    setAgreeTerms,
    setAgreePrivacy,
    setOpenTermsModal,
    setOpenPrivacyModal,
    handleSignup,
    handleRoleChange
  }
}

