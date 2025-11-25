import React from 'react'
import bookmarkedSentences from '../../../data/myPageBookmarks.json'
import recordings from '../../../data/myPageRecordings.json'

export default function useUserPage() {
  const [email, setEmail] = React.useState('skala@company.com')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const handleEmailChange = (e) => setEmail(e.target.value)
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value)
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value)

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







