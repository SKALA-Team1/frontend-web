/**
 * 애플리케이션 드로어 (사이드바)
 * 
 * 역할:
 * - 네비게이션 메뉴 표시
 */

import React from 'react'
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SchoolIcon from '@mui/icons-material/School'
import FeedbackIcon from '@mui/icons-material/Feedback'
import PersonIcon from '@mui/icons-material/Person'
import { NAV_LINKS } from '../../config/constants'

// 아이콘 매핑
const ICON_MAP = {
  home: <HomeIcon />,
  learn: <SchoolIcon />,
  feedback: <FeedbackIcon />,
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
          background: '#FFFFFF',
          color: '#212121',
          borderRight: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
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
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="h6">영어회화</Typography>
          <Typography variant="body2" color="text.primary">
            SKALA
          </Typography>
        </Box>

        <Divider />

        {/* 네비게이션 링크 */}
        <List sx={{ flex: 1 }}>
          {NAV_LINKS.map((item) => (
            <ListItemButton
              key={item.path}
              selected={currentPath === item.path}
              onClick={() => onNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                color: '#212121',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(108,99,255,0.12)',
                  color: '#6C63FF',
                  boxShadow: '0 2px 8px rgba(108,99,255,0.2)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {ICON_MAP[item.key]}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ sx: { fontWeight: 600 } }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider />

        {/* 푸터 */}
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.primary">
            © {new Date().getFullYear()} Prototype
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}


