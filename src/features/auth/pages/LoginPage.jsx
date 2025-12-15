import React from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import Notification from '../../../components/Common/Notification.jsx'
import useNotification from '../../../hooks/useNotification.js'
import { login } from '../../../services/authService'
import { ROUTES } from '../../../config/constants'

export default function LoginPage() {
  const navigate = useNavigate()
  const notification = useNotification()

  const handleLogin = async ({ email, password }) => {
    try {
      await login(email, password)
      
      notification.showSuccess('로그인에 성공했습니다.')
      
    // 알림창이 표시된 후 홈으로 이동
    setTimeout(() => {
        navigate(ROUTES.ROLEPLAYING)
    }, 1500) // 1.5초 후 이동
    } catch (error) {
      notification.showError(error.message || '로그인에 실패했습니다.')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { getGoogleLoginUrl } = await import('../../../services/authService')
      const googleLoginUrl = await getGoogleLoginUrl()
      
      // Google 로그인 페이지로 리다이렉트
      window.location.href = googleLoginUrl
    } catch (error) {
      console.error('Google 로그인 URL 조회 실패:', error)
      notification.showError('Google 로그인을 시작할 수 없습니다.')
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: 4, backgroundColor: '#FFFFFF' }}>
      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <LoginForm
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onNavigateSignup={() => navigate(ROUTES.SIGNUP)}
        />
      </Box>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={notification.closeNotification}
      />
    </Box>
  )
}
