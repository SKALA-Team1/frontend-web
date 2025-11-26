import React, { useState } from 'react'
import { Box, Snackbar, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleSuccess = () => {
    setOpenSnackbar(true)
    // 알림창이 표시된 후 홈으로 이동
    setTimeout(() => {
      navigate('/home')
    }, 1500) // 1.5초 후 이동
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}>
      <LoginForm
        onLogin={handleSuccess}
        onGoogleLogin={handleSuccess}
        onNavigateSignup={() => navigate('/signup')}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '70%' }}>
          로그인에 성공했습니다.
        </Alert>
      </Snackbar>
    </Box>
  )
}
