import React from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Box, Toolbar, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Container, Typography, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy'
import SchoolIcon from '@mui/icons-material/School'
import PersonIcon from '@mui/icons-material/Person'
import HomePage from './features/home/HomePage.jsx'
import RoleplayPage from './features/roleplay/pages/RoleplayPage.jsx'
import LearnPage from './features/learn/LearnPage.jsx'
import UserPage from './features/user/UserPage.jsx'
import LoginPage from './features/auth/pages/LoginPage.jsx'
import SignUpPage from './features/auth/pages/SignUpPage.jsx'

const links = [
  { label: '홈', path: '/home', icon: <HomeIcon /> },
  { label: '롤플레잉', path: '/roleplay', icon: <TheaterComedyIcon /> },
  { label: '학습', path: '/learn', icon: <SchoolIcon /> },
  { label: '마이페이지', path: '/mypage', icon: <PersonIcon /> }
]

export default function App() {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 900px)') // md breakpoint
  const drawerWidth = 280
  const isLogin = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup'

  const handleToggle = () => setOpen((v) => !v)
  const handleNavigate = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      {!isLogin && (
        <>
          <AppBar
            position="fixed"
            color="default"
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              borderBottom: 'none',
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
                sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }}
              >
                <MenuIcon />
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
                background: '#ffffff',
                color: 'text.primary',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)'
              }
            }}
            sx={{
              display: { xs: 'block', md: 'block' }
            }}
          >
            <Box role="presentation" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="h6">영어회화</Typography>
                <Typography variant="body2" color="text.secondary">SKALA</Typography>
              </Box>
              <Divider />
              <List sx={{ flex: 1 }}>
                {links.map((item) => (
                  <ListItemButton
                    key={item.path}
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 0, 0, 0.06)',
                        borderLeft: 'none'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontWeight: 600 } }} />
                  </ListItemButton>
                ))}
              </List>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} Prototype</Typography>
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
          pt: isLogin ? 0 : { xs: 7, sm: 8 },
          ...(isDesktop && !isLogin && { ml: `${drawerWidth}px` })
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ py: { xs: 2, sm: 3 } }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/roleplay" element={<RoleplayPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/mypage" element={<UserPage />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  )
}


