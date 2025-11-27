import React from 'react'

/**
 * 회원가입 시 선택 가능한 역할 목록
 * Tech, Business, Operation 카테고리별로 세부 역할이 정의되어 있음
 */
const roles = {
  Tech: ['SW Engineering', 'Cloud/Infra Engineering', 'AI/Data Engineering'],
  Business: ['서비스 기획', '전략 기획', '영업 / 마케팅', '컨설팅'],
  Operation: ['재무 • 회계 • 구매', 'HRD']
}

/**
 * 이메일 형식 검증을 위한 정규표현식
 * 기본적인 이메일 형식 (user@domain.com)을 검증
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 회원가입 폼 관리를 위한 커스텀 훅
 * 
 * @param {Function} onComplete - 역할 선택 완료 시 호출되는 콜백 함수
 *                                파라미터: selectedRole (string)
 * 
 * @returns {Object} 회원가입 폼 상태, 에러, 핸들러, 역할 목록
 */
export default function useSignupForm(onComplete) {
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
  
  // 온보딩(역할 선택) 화면 표시 여부
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  
  // 선택된 역할
  const [selectedRole, setSelectedRole] = React.useState('')
  
  // 각 필드별 에러 메시지 상태
  const [errors, setErrors] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  /**
   * 이름 유효성 검증 함수
   * @param {string} value - 검증할 이름 값
   * @returns {string} 에러 메시지 (유효하면 빈 문자열)
   */
  const validateName = (value) => {
    if (!value) return ''
    if (value.length > 10) return '이름은 10자 내외로 입력해주세요.'
    return ''
  }

  /**
   * 이메일 유효성 검증 함수
   * @param {string} value - 검증할 이메일 값
   * @returns {string} 에러 메시지 (유효하면 빈 문자열)
   */
  const validateEmail = (value) => {
    if (!value) return ''
    if (!emailRegex.test(value)) return '이메일 형태가 올바르지 않아요.'
    return ''
  }

  /**
   * 비밀번호 유효성 검증 함수
   * @param {string} value - 검증할 비밀번호 값
   * @returns {string} 에러 메시지 (유효하면 빈 문자열)
   */
  const validatePassword = (value) => {
    if (!value) return ''
    if (value.length < 8 || value.length > 20) return '비밀번호는 8~20자로 입력해주세요.'
    return ''
  }

  /**
   * 비밀번호 확인 유효성 검증 함수
   * @param {string} value - 검증할 비밀번호 확인 값
   * @returns {string} 에러 메시지 (유효하면 빈 문자열)
   */
  const validateConfirmPassword = (value) => {
    if (!value) return ''
    if (value !== signupPassword) return '비밀번호가 일치하지 않아요.'
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
    setErrors((prev) => ({ ...prev, name: validateName(value) }))
  }

  /**
   * 이메일 입력 변경 핸들러
   * 입력값을 업데이트하고 실시간으로 유효성 검증 수행
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleEmailChange = (event) => {
    const value = event.target.value
    setSignupEmail(value)
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
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
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }))
    // 비밀번호가 변경되면 비밀번호 확인도 재검증
    if (confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }))
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
    setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(value) }))
  }

  /**
   * 회원가입 제출 핸들러
   * 온보딩(역할 선택) 화면을 표시
   */
  const handleSignup = () => {
    setShowOnboarding(true)
  }

  /**
   * 역할 선택 핸들러
   * 선택된 역할을 저장하고 onComplete 콜백 호출
   * @param {string} role - 선택된 역할
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    if (onComplete) {
      onComplete(role)
    }
  }

  /**
   * 폼 초기화 함수
   * 모든 입력값과 상태를 초기 상태로 리셋
   */
  const reset = () => {
    setName('')
    setSignupEmail('')
    setSignupPassword('')
    setConfirmPassword('')
    setAgreeTerms(false)
    setAgreePrivacy(false)
    setShowOnboarding(false)
    setSelectedRole('')
  }

  return {
    name,
    signupEmail,
    signupPassword,
    confirmPassword,
    agreeTerms,
    agreePrivacy,
    openTermsModal,
    openPrivacyModal,
    showOnboarding,
    selectedRole,
    errors,
    roles,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    setAgreeTerms,
    setAgreePrivacy,
    setOpenTermsModal,
    setOpenPrivacyModal,
    handleSignup,
    handleRoleSelect,
    reset
  }
}

