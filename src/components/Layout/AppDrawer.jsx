/**
 * 애플리케이션 드로어 (사이드바)
 * 
 * 역할:
 * - 네비게이션 메뉴 표시
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SchoolIcon from '@mui/icons-material/School'
import FeedbackIcon from '@mui/icons-material/Feedback'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { NAV_LINKS, ROUTES } from '../../config/constants'
import { getCurrentUser } from '../../services/userService'
import { logout } from '../../services/authService'
import skuseMeLogo from '../../images/skuse_me.png'

// 아이콘 매핑
const ICON_MAP = {
  roleplay: <HomeIcon />,
  learn: <SchoolIcon />,
  feedback: <FeedbackIcon />,
  bookmark: <BookmarkIcon />,
  mypage: <PersonIcon />,
}

export default function AppDrawer({
  open,
  onClose,
  onNavigate,
  currentPath,
  drawerWidth,
  isDesktop,
}) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
    } finally {
      // 로그아웃 API 성공/실패 여부와 관계없이 로그인 페이지로 이동
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getCurrentUser()
        const name = userInfo.name || userInfo.username || ''
        setUserName(name)
        setUserEmail(userInfo.email || '')
      } catch (error) {
        console.error('사용자 정보를 가져오는데 실패했습니다:', error)
      }
    }

    fetchUserInfo()
  }, [])

  return (
    <Drawer
      anchor="left"
      variant={isDesktop ? 'permanent' : 'temporary'}
      open={isDesktop ? true : open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: drawerWidth,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,255,0.95) 100%)',
          color: '#212121',
          borderRight: '1px solid rgba(124,108,255,0.1)',
          boxShadow: '4px 0 24px rgba(124,108,255,0.08)',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        display: { xs: 'block', md: 'block' },
      }}
    >
      <Box
        role="presentation"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* 로고 영역 */}
        <Box 
          sx={{ 
            px: 2.5, 
            pt: 3.5, 
            pb: 2.5,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid rgba(124,108,255,0.1)'
          }}
        >
          <Box
            component="img"
            src={skuseMeLogo}
            alt="SKuse ME"
            sx={{
              width: '100%',
              maxWidth: '140px',
              height: 'auto',
              objectFit: 'contain',
              mb: 3,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* 사용자 정보 영역 */}
          <Box>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #212121 0%, #424242 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '1rem',
              }}
            >
              {userName || '사용자'} 님
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(0,0,0,0.6)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                fontSize: '0.75rem',
              }}
            >
              {userEmail}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(124,108,255,0.1)' }} />

        {/* 네비게이션 링크 */}
        <List sx={{ flex: 1, py: 2, px: 1.5 }}>
          {NAV_LINKS.filter(item => item.key !== 'mypage').map((item) => {
            const isSelected = currentPath === item.path
            return (
              <ListItemButton
                key={item.path}
                selected={isSelected}
                onClick={() => onNavigate(item.path)}
                sx={{
                  borderRadius: 1.25,
                  mb: 1,
                  py: 1.25,
                  px: 2,
                  color: isSelected ? '#7C6CFF' : '#212121',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: isSelected ? '4px' : '0px',
                    height: isSelected ? '60%' : '0%',
                    background: 'linear-gradient(180deg, #7C6CFF 0%, #4B3CF8 100%)',
                    borderRadius: '0 1px 1px 0',
                    transition: 'all 0.3s ease'
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(124,108,255,0.12) 0%, rgba(75,60,248,0.08) 100%)',
                    color: '#7C6CFF',
                    boxShadow: '0 4px 12px rgba(124,108,255,0.15)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(124,108,255,0.16) 0%, rgba(75,60,248,0.12) 100%)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(124,108,255,0.06)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit', 
                    minWidth: 44,
                    '& svg': {
                      fontSize: 24
                    }
                  }}
                >
                  {ICON_MAP[item.key]}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ 
                    sx: { 
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: '0.9375rem'
                    } 
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(124,108,255,0.1)' }} />

        {/* 푸터 */}
        <Box sx={{ p: 2.5 }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={handleLogout}
            sx={{
              color: '#FF6B6B',
              borderColor: 'rgba(255,107,107,0.3)',
              borderWidth: 2,
              borderRadius: 1.25,
              py: 1.25,
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, rgba(255,107,107,0.05) 0%, rgba(255,82,82,0.03) 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255,107,107,0.12) 0%, rgba(255,82,82,0.08) 100%)',
                borderColor: 'rgba(255,107,107,0.5)',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255,107,107,0.2)',
              },
            }}
          >
            로그아웃
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}


