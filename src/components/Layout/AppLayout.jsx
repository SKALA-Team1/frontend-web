/**
 * 애플리케이션 레이아웃
 * 
 * 역할:
 * - 전체 레이아웃 구조 정의
 * - 네비게이션 드로어 관리
 */

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Container, useMediaQuery } from '@mui/material'
import AppDrawer from './AppDrawer'
import AppHeader from './AppHeader'
import { ROUTES, UI } from '../../config/constants'

export default function AppLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(`(min-width: ${UI.MOBILE_BREAKPOINT}px)`)

  // 인증 페이지인지 확인
  const isAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].includes(location.pathname)

  // 로그인 페이지로 이동할 때 drawer 닫기
  useEffect(() => {
    if (isAuthPage) {
      setDrawerOpen(false)
    }
  }, [isAuthPage])

  const handleToggleDrawer = () => setDrawerOpen((v) => !v)
  const handleCloseDrawer = () => setDrawerOpen(false)
  const handleNavigate = (path) => {
    navigate(path)
    handleCloseDrawer()
  }

  // 웹/모바일에 따라 drawer width 설정
  const drawerWidth = isDesktop ? UI.DRAWER_WIDTH_DESKTOP : UI.DRAWER_WIDTH_MOBILE

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {!isAuthPage && (
        <>
          <AppHeader
            onToggleDrawer={handleToggleDrawer}
            drawerWidth={drawerWidth}
            isDesktop={isDesktop}
          />
          <AppDrawer
            open={drawerOpen}
            onClose={handleCloseDrawer}
            onNavigate={handleNavigate}
            currentPath={location.pathname}
            drawerWidth={drawerWidth}
            isDesktop={isDesktop}
          />
        </>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          pt: isAuthPage ? 0 : { xs: 6.25, sm: 6.25 },
          pb: 0,
          ...(isDesktop && !isAuthPage && { ml: `${drawerWidth}px` }),
        }}
      >
        <Container
          maxWidth="sm"
          disableGutters
          sx={{
            pt: 2,
            pb: 0.5,
            px: { xs: 2.5, sm: 3 },
            width: '100%',
            maxWidth: { xs: '100%', sm: `${UI.MAX_CONTAINER_WIDTH}px` },
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  )
}









