import React from 'react'

/**
 * 로그인 폼 관리를 위한 커스텀 훅
 * 
 * @param {Function} onSubmit - 로그인 제출 시 호출되는 콜백 함수
 *                             파라미터: { email: string, password: string }
 * 
 * @returns {Object} 로그인 폼 상태 및 핸들러
 *   - email: string - 이메일 입력값
 *   - password: string - 비밀번호 입력값
 *   - handleEmailChange: Function - 이메일 입력 변경 핸들러
 *   - handlePasswordChange: Function - 비밀번호 입력 변경 핸들러
 *   - handleSubmit: Function - 로그인 제출 핸들러
 */
export default function useLoginForm(onSubmit) {
  // 이메일 입력 상태 관리
  const [email, setEmail] = React.useState('')
  
  // 비밀번호 입력 상태 관리
  const [password, setPassword] = React.useState('')

  /**
   * 이메일 입력 필드 변경 핸들러
   * @param {Event} event - 입력 이벤트 객체
   */
  const handleEmailChange = (event) => setEmail(event.target.value)
  
  /**
   * 비밀번호 입력 필드 변경 핸들러
   * @param {Event} event - 입력 이벤트 객체
   */
  const handlePasswordChange = (event) => setPassword(event.target.value)

  /**
   * 로그인 제출 핸들러
   * onSubmit 콜백이 제공된 경우, 이메일과 비밀번호를 전달하여 호출
   */
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ email, password })
    }
  }

  return {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  }
}