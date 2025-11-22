import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6C63FF' },
    secondary: { main: '#FFBF6B' },
    background: { default: '#05060A', paper: '#11131A' },
    text: {
      primary: '#F5F6FF',
      secondary: '#F5F6FF'
    },
    divider: 'rgba(255,255,255,0.12)'
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      "'NanumSquare', 'NanumSquareR', 'NanumSquareB', 'NanumSquareEB', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    h5: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: -0.2 }, // 24px
    h6: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: -0.1 }, // 20px
    subtitle1: { fontSize: '1.25rem' }, // 20px
    subtitle2: { fontSize: '1.125rem' }, // 18px
    body1: { fontSize: '1.125rem' }, // 18px
    body2: { fontSize: '1.125rem' }, // 18px
    button: { fontSize: '1.125rem', textTransform: 'none', fontWeight: 600 }, // 18px
    caption: { fontSize: '1rem' } // 16px
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#05060A',
          color: '#F5F6FF'
        }
      }
    },
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
          borderColor: 'rgba(255,255,255,0.4)',
          color: '#F5F6FF',
          '&:hover': {
            borderColor: '#F5F6FF',
            backgroundColor: 'rgba(255,255,255,0.08)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(12px)',
          color: '#F5F6FF'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#05060A',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0B0C12',
          color: '#F5F6FF',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.08)',
          color: '#F5F6FF'
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.4)',
          color: '#F5F6FF'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.12)' }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.04)'
        },
        notchedOutline: {
          borderColor: 'rgba(255,255,255,0.18)'
        },
        input: {
          color: '#F5F6FF'
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(245,246,255,0.64)'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': {
            backgroundColor: 'rgba(108,99,255,0.18)'
          }
        }
      }
    }
  }
})

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


