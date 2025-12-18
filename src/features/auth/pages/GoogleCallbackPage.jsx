import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { ROUTES } from '../../../config/constants'
import { getCurrentUser } from '../../../services/userService'
import { setAccessToken } from '../../../services/httpClient'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('토큰 처리 중...')

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token')
      const error = searchParams.get('error')

      if (error) {
        // 에러가 있으면 로그인 페이지로 리다이렉트
        console.error('Google OAuth 에러:', error)
        navigate(ROUTES.LOGIN + '?error=' + encodeURIComponent(error), { replace: true })
        return
      }

      if (!accessToken) {
        // Access Token이 없으면 로그인 페이지로 리다이렉트
        // Refresh Token은 백엔드에서 쿠키로 설정됨
        console.error('Google OAuth callback: Access Token을 받지 못했습니다.')
        navigate(ROUTES.LOGIN, { replace: true })
        return
      }

      // Access Token을 메모리에 저장 (URL 디코딩된 토큰 사용)
      const decodedAccessToken = decodeURIComponent(accessToken)
      setAccessToken(decodedAccessToken)
      
      // Refresh Token은 백엔드에서 httpOnly 쿠키로 설정되므로 프론트엔드에서 저장 불필요
      console.log('Access Token 저장 완료 (메모리):', {
        accessTokenLength: decodedAccessToken.length
      })

      try {
        // 사용자 정보 조회 (토큰이 저장된 후 호출)
        setStatus('사용자 정보 확인 중...')
        const userInfo = await getCurrentUser()
        
        // job_role이 없으면 직무 입력 페이지로 이동
        const jobRole = userInfo.job_role || userInfo.jobRole
        if (!jobRole || jobRole.trim() === '') {
          navigate(ROUTES.JOB_ROLE_ONBOARDING, { replace: true })
          return
        }
        
        // job_role이 있으면 롤플레잉 페이지로 이동
        navigate(ROUTES.ROLEPLAYING, { replace: true })
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err)
        // 토큰은 저장되었으므로, 일단 직무 입력 페이지로 이동 (job_role 확인 불가)
        navigate(ROUTES.JOB_ROLE_ONBOARDING, { replace: true })
      }
    }

    handleCallback()
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
        {status}
      </Typography>
    </Box>
  )
}




