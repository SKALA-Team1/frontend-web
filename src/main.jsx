import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#000000' },
    secondary: { main: '#000000' },
    background: { default: '#ffffff', paper: '#ffffff' },
    divider: 'rgba(0, 0, 0, 0.12)'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "'Inter', 'Noto Sans KR', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans', 'Liberation Sans', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
    h5: { fontWeight: 700, letterSpacing: -0.2 },
    h6: { fontWeight: 600, letterSpacing: -0.1 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        containedPrimary: { backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#111' } },
        outlinedPrimary: { borderColor: '#000', color: '#000', '&:hover': { borderColor: '#000', backgroundColor: 'rgba(0,0,0,0.04)' } }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14 }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#ffffff', color: '#000000' }
      }
    },
    MuiChip: {
      styleOverrides: {
        outlined: { borderColor: '#000000', color: '#000000' }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(0, 0, 0, 0.12)' }
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


