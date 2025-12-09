/**
 * 애플리케이션 루트 컴포넌트
 * 
 * 역할:
 * - 전체 라우팅 설정
 * - Lazy Loading을 통한 코드 스플리팅
 * - 레이아웃 구조 정의
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import ProtectedRoute from './components/Route/ProtectedRoute'
import LoadingSpinner from './components/Common/LoadingSpinner'
import ErrorBoundary from './components/Common/ErrorBoundary'
import { ROUTES } from './config/constants'

// Lazy Loading으로 페이지 컴포넌트 로드
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const SignUpPage = lazy(() => import('./features/auth/pages/SignUpPage'))
const RoleplayPage = lazy(() => import('./features/roleplay/pages/RoleplayPage'))
const LearnPage = lazy(() => import('./features/learn/pages/LearnPage'))
const FeedbackPage = lazy(() => import('./features/feedback/pages/FeedbackPage'))
const UserPage = lazy(() => import('./features/user/pages/UserPage'))

// 라우트 설정 배열
const routes = [
  { path: ROUTES.LOGIN, element: <LoginPage />, public: true },
  { path: ROUTES.SIGNUP, element: <SignUpPage />, public: true },
  { path: ROUTES.ROLEPLAYING, element: <RoleplayPage />, protected: true },
  { path: ROUTES.LEARN, element: <LearnPage />, protected: true },
  { path: ROUTES.FEEDBACK, element: <FeedbackPage />, protected: true },
  { path: ROUTES.BOOKMARK, element: <UserPage />, protected: true },
  { path: ROUTES.MYPAGE, element: <UserPage />, protected: true },
]

export default function App() {
  return (
    <ErrorBoundary>
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {routes.map(({ path, element, protected: isProtected }) => (
              <Route
                key={path}
                path={path}
                element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
              />
            ))}
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
        </Suspense>
      </AppLayout>
    </ErrorBoundary>
  )
}
