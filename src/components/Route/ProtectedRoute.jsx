/**
 * 보호된 라우트
 * 
 * 역할:
 * - 인증이 필요한 페이지에 대한 접근 제어
 * - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../../services/authService'
import { ROUTES } from '../../config/constants'

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return children
}















