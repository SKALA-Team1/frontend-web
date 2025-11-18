import React from 'react'

export default function useLoginForm(onSubmit) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleEmailChange = (event) => setEmail(event.target.value)
  const handlePasswordChange = (event) => setPassword(event.target.value)

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



