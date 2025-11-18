import React from 'react'

const roles = {
  Tech: ['SW Engineering', 'Cloud/Infra Engineering', 'AI/Data Engineering'],
  Business: ['서비스 기획', '전략 기획', '영업 / 마케팅', '컨설팅'],
  Operation: ['재무 • 회계 • 구매', 'HRD']
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function useSignupForm(onComplete) {
  const [name, setName] = React.useState('')
  const [signupEmail, setSignupEmail] = React.useState('')
  const [signupPassword, setSignupPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [agreeTerms, setAgreeTerms] = React.useState(false)
  const [agreePrivacy, setAgreePrivacy] = React.useState(false)
  const [openTermsModal, setOpenTermsModal] = React.useState(false)
  const [openPrivacyModal, setOpenPrivacyModal] = React.useState(false)
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState('')
  const [errors, setErrors] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const validateName = (value) => {
    if (!value) return ''
    if (value.length > 10) return '이름은 10자 내외로 입력해주세요.'
    return ''
  }

  const validateEmail = (value) => {
    if (!value) return ''
    if (!emailRegex.test(value)) return '이메일 형태가 올바르지 않아요.'
    return ''
  }

  const validatePassword = (value) => {
    if (!value) return ''
    if (value.length < 8 || value.length > 20) return '비밀번호는 8~20자로 입력해주세요.'
    return ''
  }

  const validateConfirmPassword = (value) => {
    if (!value) return ''
    if (value !== signupPassword) return '비밀번호가 일치하지 않아요.'
    return ''
  }

  const handleNameChange = (event) => {
    const value = event.target.value
    setName(value)
    setErrors((prev) => ({ ...prev, name: validateName(value) }))
  }

  const handleEmailChange = (event) => {
    const value = event.target.value
    setSignupEmail(value)
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
  }

  const handlePasswordChange = (event) => {
    const value = event.target.value
    setSignupPassword(value)
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }))
    if (confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }))
    }
  }

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value
    setConfirmPassword(value)
    setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(value) }))
  }

  const handleSignup = () => {
    setShowOnboarding(true)
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    if (onComplete) {
      onComplete(role)
    }
  }

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

