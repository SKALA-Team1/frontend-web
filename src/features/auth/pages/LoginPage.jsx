import React from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const handleSuccess = () => navigate('/home')

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}>
      <LoginForm
        onLogin={handleSuccess}
        onGoogleLogin={handleSuccess}
        onNavigateSignup={() => navigate('/signup')}
      />
    </Box>
  )
}
