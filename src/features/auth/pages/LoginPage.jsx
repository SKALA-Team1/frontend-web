import React, { useState } from 'react'
import { Box, Snackbar, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { login } from '../../../api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await login(email, password)
      
      // 토큰 저장
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken)
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      
      setSnackbarMessage('로그인에 성공했습니다.')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
      
      // 알림창이 표시된 후 홈으로 이동
      setTimeout(() => {
        navigate('/home')
      }, 1500) // 1.5초 후 이동
    } catch (error) {
      setSnackbarMessage(error.message || '로그인에 실패했습니다.')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  const handleGoogleLogin = () => {
    // Google 로그인은 추후 구현
    setSnackbarMessage('Google 로그인은 아직 지원되지 않습니다.')
    setSnackbarSeverity('info')
    setOpenSnackbar(true)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}>
      <LoginForm
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onNavigateSignup={() => navigate('/signup')}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '70%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
