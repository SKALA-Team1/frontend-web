import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { ROUTES, STORAGE_KEYS } from '../../../config/constants'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const error = searchParams.get('error')

    if (error) {
      // 에러가 있으면 로그인 페이지로 리다이렉트
      console.error('Google OAuth 에러:', error)
      navigate(ROUTES.LOGIN + '?error=' + encodeURIComponent(error), { replace: true })
    } else if (accessToken && refreshToken) {
      // 토큰 저장
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)

      // 홈으로 리다이렉트
      navigate(ROUTES.ROLEPLAYING, { replace: true })
    } else {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      console.error('Google OAuth callback: 토큰을 받지 못했습니다.')
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        로그인 중...
      </Typography>
    </Box>
  )
}


