/**
 * 애플리케이션 헤더
 * 
 * 역할:
 * - 모바일에서 햄버거 메뉴 버튼 표시
 */

import React from 'react'
import { AppBar, Toolbar, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

export default function AppHeader({ onToggleDrawer, drawerWidth, isDesktop }) {
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#212121',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        ...(isDesktop && { width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }),
        display: { xs: 'block', md: 'none' },
        height: '50px',
        '& .MuiToolbar-root': {
          minHeight: '50px !important',
          height: '50px'
        }
      }}
    >
      <Toolbar sx={{ minHeight: '50px !important', height: '50px' }}>
        <IconButton
          color="inherit"
          edge="start"
          aria-label="메뉴 열기"
          onClick={onToggleDrawer}
          sx={{
            mr: 1,
            display: { xs: 'inline-flex', md: 'none' },
            width: 32,
            height: 32,
          }}
        >
          <MenuIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}


