/**
 * 애플리케이션 진입점
 * 
 * 역할:
 * - React 앱 초기화 및 렌더링
 * - Material-UI 테마 설정
 * - 라우터 및 전역 설정
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import './index.css'

// Material-UI 라이트 테마 설정
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6C63FF' },
    secondary: { main: '#FFBF6B' },
    background: { default: '#FFFFFF', paper: '#F5F5F5' },
    text: {
      primary: '#212121',
      secondary: '#757575'
    },
    divider: 'rgba(0,0,0,0.12)'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "'NanumSquare', 'NanumSquareR', 'NanumSquareB', 'NanumSquareEB', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    h4: { fontSize: '1.3125rem', fontWeight: 700, letterSpacing: -0.2 },
    h5: { fontSize: '1.125rem', fontWeight: 700, letterSpacing: -0.2 },
    h6: { fontSize: '0.9375rem', fontWeight: 600, letterSpacing: -0.1 },
    subtitle1: { fontSize: '0.9375rem' },
    subtitle2: { fontSize: '0.84375rem' },
    body1: { fontSize: '0.84375rem' },
    body2: { fontSize: '0.84375rem' },
    button: { fontSize: '0.84375rem', textTransform: 'none', fontWeight: 600 },
    caption: { fontSize: '0.75rem' }
  },
  components: {
    // 버튼 스타일 커스터마이징
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 18,
          fontWeight: 600
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C6CFF 0%, #5546D7 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #8473ff 0%, #5c4ee2 100%)'
          }
        },
        outlinedPrimary: {
          borderColor: 'rgba(0,0,0,0.23)',
          color: '#6C63FF',
          '&:hover': {
            borderColor: '#6C63FF',
            backgroundColor: 'rgba(108,99,255,0.04)'
          }
        }
      }
    },
    // 카드 스타일
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#212121'
        }
      }
    },
    // 앱바 스타일
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#212121',
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
      }
    },
    // 드로어(사이드바) 스타일
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          color: '#212121',
          borderRight: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }
      }
    },
    // 칩 스타일
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: 'rgba(0,0,0,0.08)',
          color: '#212121'
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.23)',
          color: '#212121'
        }
      }
    },
    // 구분선 스타일
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(0,0,0,0.12)' }
      }
    },
    // 입력 필드 스타일
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input': {
            color: '#212121 !important',
            WebkitTextFillColor: '#212121 !important'
          },
          '& input[type=password]': {
            color: '#212121 !important',
            WebkitTextFillColor: '#212121 !important',
            fontFamily: 'text-security-disc !important',
            '-webkit-text-security': 'disc !important'
          }
        },
        input: {
          color: '#212121 !important',
          WebkitTextFillColor: '#212121 !important',
    
          '&[type=password]': {
            color: '#212121 !important',
            WebkitTextFillColor: '#212121 !important',
            fontFamily: 'text-security-disc !important',
            '-webkit-text-security': 'disc !important'
          },
    
          '&:-webkit-autofill': {
            WebkitTextFillColor: '#212121 !important',
            boxShadow: '0 0 0px 1000px #FFFFFF inset !important'
          }
        }
      }
    }
    
    ,
    // 입력 라벨 스타일
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(0,0,0,0.6)'
        }
      }
    },
    // 리스트 아이템 버튼 스타일
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': {
            backgroundColor: 'rgba(108,99,255,0.12)',
            color: '#6C63FF'
          },
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
        }
      }
    }
  }
})

// React 앱 렌더링
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
