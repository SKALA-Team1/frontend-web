import React from 'react'
import recordings from '../../../data/myPageRecordings.json'

/**
 * 마이페이지 관리를 위한 커스텀 훅
 * 
 * 사용자 계정 정보, 북마크한 문장, 녹음 기록 등을 관리
 * 
 * @returns {Object} 마이페이지 상태 및 핸들러
 *   - email: string - 사용자 이메일
 *   - newPassword: string - 새 비밀번호 입력값
 *   - confirmPassword: string - 비밀번호 확인 입력값
 *   - bookmarkedSentences: Array - 북마크한 문장 목록
 *   - recordings: Array - 녹음 기록 목록 (JSON 데이터)
 *   - handleEmailChange: Function - 이메일 변경 핸들러
 *   - handleNewPasswordChange: Function - 새 비밀번호 변경 핸들러
 *   - handleConfirmPasswordChange: Function - 비밀번호 확인 변경 핸들러
 *   - handleAccountSave: Function - 계정 정보 저장 핸들러
 */
export default function useUserPage() {
  // 사용자 이메일 상태 (기본값: skala@company.com)
  const [email, setEmail] = React.useState('skala@company.com')
  
  // 새 비밀번호 입력 상태
  const [newPassword, setNewPassword] = React.useState('')
  
  // 비밀번호 확인 입력 상태
  const [confirmPassword, setConfirmPassword] = React.useState('')
  
  // 북마크한 문장 목록 상태 (빈 배열 - UI 호환성 유지)
  const [bookmarkedSentences] = React.useState([])

  /**
   * 이메일 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleEmailChange = (e) => setEmail(e.target.value)
  
  /**
   * 새 비밀번호 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value)
  
  /**
   * 비밀번호 확인 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value)

  /**
   * 계정 정보 저장 핸들러
   * 현재는 알림만 표시하며, 실제 저장 로직은 추후 백엔드 연동 예정
   */
  const handleAccountSave = () => {
    // 실제 저장 로직은 추후 연동
    alert('계정 정보가 업데이트되었습니다.')
  }

  return {
    email,
    newPassword,
    confirmPassword,
    bookmarkedSentences,
    recordings,
    handleEmailChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleAccountSave
  }
}


