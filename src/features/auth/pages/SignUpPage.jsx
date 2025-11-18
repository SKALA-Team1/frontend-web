import React from 'react'
import useSignupForm from '../hooks/useSignupForm'
import SignUpForm from '../components/SignUpForm.jsx'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const navigate = useNavigate()
  const signup = useSignupForm(() => navigate('/home'))

  return (
    <SignUpForm
      {...signup}
      onNavigateLogin={() => navigate('/login')}
    />
  )
}

