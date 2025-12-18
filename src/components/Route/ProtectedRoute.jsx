/**
 * 보호된 라우트
 * 
 * 역할:
 * - 인증이 필요한 페이지에 대한 접근 제어
 * - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 * - 새로고침 시 Refresh Token으로 Access Token 갱신 시도
 */

import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../../services/authService'
import { ROUTES } from '../../config/constants'
import { refreshAccessToken } from '../../services/httpClient'
import LoadingSpinner from '../Common/LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // 메모리에 Access Token이 있으면 바로 통과
      if (isAuthenticated()) {
        setIsAuth(true)
        setIsChecking(false)
        return
      }

      // Access Token이 없으면 Refresh Token으로 갱신 시도
      try {
        console.log('[ProtectedRoute] Refresh Token으로 Access Token 갱신 시도')
        await refreshAccessToken()
        console.log('[ProtectedRoute] Refresh 성공, 인증 완료')
        setIsAuth(true)
      } catch (error) {
        console.error('[ProtectedRoute] Refresh 실패:', error.message)
        setIsAuth(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  if (isChecking) {
    return <LoadingSpinner />
  }

  if (!isAuth) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return children
}



























