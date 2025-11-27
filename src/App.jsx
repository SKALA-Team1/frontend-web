import React from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Box, Toolbar, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Container, Typography, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import SchoolIcon from '@mui/icons-material/School'
import FeedbackIcon from '@mui/icons-material/Feedback'
import PersonIcon from '@mui/icons-material/Person'
import RoleplayPage from './features/roleplay/pages/RoleplayPage.jsx'
import LearnPage from './features/learn/pages/LearnPage.jsx'
import FeedbackPage from './features/feedback/pages/FeedbackPage.jsx'
import UserPage from './features/user/pages/UserPage.jsx'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import SignUpPage from './features/auth/pages/SignUpPage.jsx'
import WatchNotificationPage from './apple_watch/WatchNotificationPage.jsx'
import WatchPage from './apple_watch/WatchPage.jsx'

const links = [
  { label: '홈', path: '/home', icon: <HomeIcon /> },
  { label: '학습', path: '/learn', icon: <SchoolIcon /> },
  { label: '피드백', path: '/feedback', icon: <FeedbackIcon /> },
  { label: '마이페이지', path: '/mypage', icon: <PersonIcon /> }
]

export default function App() {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 900px)') // md breakpoint
  const drawerWidth = 280
  const isLogin = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup'
  const isWatchPage = location.pathname === '/notification' || location.pathname === '/watch'

  const handleToggle = () => setOpen((v) => !v)
  const handleNavigate = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {!isLogin && !isWatchPage && (
        <>
          <AppBar
            position="fixed"
            color="default"
            elevation={0}
            sx={{
              backgroundColor: 'rgba(5,6,10,0.9)',
              color: '#F5F6FF',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              ...(isDesktop && { width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }),
              display: { xs: 'block', md: 'none' }
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                aria-label="menu"
                onClick={handleToggle}
                sx={{ 
                  mr: 1, 
                  display: { xs: 'inline-flex', md: 'none' },
                  width: 48,
                  height: 48
                }}
              >
                <MenuIcon sx={{ fontSize: 45 }} />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Drawer
            anchor="left"
            variant={isDesktop ? 'permanent' : 'temporary'}
            open={isDesktop ? true : open}
            onClose={() => setOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
              sx: {
                width: drawerWidth,
              background: 'linear-gradient(180deg, #080910 0%, #0C0E17 100%)',
              color: '#F5F6FF',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)'
              }
            }}
            sx={{
              display: { xs: 'block', md: 'block' }
            }}
          >
            <Box role="presentation" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="h6">영어회화</Typography>
                <Typography variant="body2" color="text.primary">SKALA</Typography>
              </Box>
              <Divider />
              <List sx={{ flex: 1 }}>
                {links.map((item) => (
                  <ListItemButton
                    key={item.path}
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      color: '#F5F6FF',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(124,108,255,0.28)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.08)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontWeight: 600 } }} />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.primary">© {new Date().getFullYear()} Prototype</Typography>
              </Box>
            </Box>
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          pt: isLogin || isWatchPage ? 0 : { xs: 7, sm: 8 },
          ...(isDesktop && !isLogin && !isWatchPage && { ml: `${drawerWidth}px` }),
          ...(isWatchPage && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#05060A'
          })
        }}
      >
        {isWatchPage ? (
          <Routes>
            <Route path="/notification" element={<WatchNotificationPage />} />
            <Route path="/watch" element={<WatchPage />} />
          </Routes>
        ) : (
          <Container
            maxWidth="sm"
            disableGutters
            sx={{ 
              py: { xs: 3, sm: 4 },
              px: { xs: 2.5, sm: 3 },
              width: '100%',
              maxWidth: { xs: '100%', sm: '600px' },
              boxSizing: 'border-box'
            }}
          >
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/home" element={<RoleplayPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/mypage" element={<UserPage />} />
            </Routes>
          </Container>
        )}
      </Box>
    </Box>
  )
}

