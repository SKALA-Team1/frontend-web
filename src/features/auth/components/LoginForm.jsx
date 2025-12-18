import React from 'react'
import { Stack, TextField, Button, Divider, Box } from '@mui/material'
import useLoginForm from '../hooks/useLoginForm'
import googleLogo from '../../../images/google_logo.png'
import skuseMeLogo from '../../../images/skuse_me.png'

export default function LoginForm({ onLogin, onGoogleLogin, onNavigateSignup }) {
  const { email, password, handleEmailChange, handlePasswordChange, handleSubmit } = useLoginForm(onLogin)

  const handleGoogle = () => {
    if (onGoogleLogin) {
      onGoogleLogin()
    }
  }

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center'}}>
        <Box
          component="img"
          src={skuseMeLogo}
          alt="SKuse ME"
          sx={{
            height: 'auto',
            maxWidth: '270px',
            width: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>

      <Box sx={{height: 30}}>
      </Box>

      <Stack spacing={1}>
        <TextField 
          label="이메일" 
          type="email" 
          value={email} 
          onChange={handleEmailChange} 
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              color: '#212121'
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(0,0,0,0.6)'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#7C6CFF'
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.23)'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(124,108,255,0.4)'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7C6CFF'
              }
            },
            '& input::placeholder': {
              color: 'rgba(0,0,0,0.5)',
              opacity: 1
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0px 1000px transparent inset !important',
              WebkitTextFillColor: '#212121 !important',
              transition: 'background-color 5000s ease-in-out 0s'
            },
            '& input:-webkit-autofill:focus': {
              WebkitBoxShadow: '0 0 0px 1000px transparent inset !important',
              WebkitTextFillColor: '#212121 !important'
            }
          }}
        />
        <TextField 
          label="비밀번호" 
          type="password" 
          value={password} 
          onChange={handlePasswordChange} 
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              color: '#212121'
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(0,0,0,0.6)'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#7C6CFF'
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.23)'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(124,108,255,0.4)'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7C6CFF'
              }
            }
          }}
        />
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ 
            py: 1.5,
            backgroundColor: '#7C6CFF',
            '&:hover': {
              backgroundColor: '#6B5CE6'
            }
          }} 
          onClick={handleSubmit}
        >
          로그인
        </Button>
        <Button 
          variant="outlined" 
          fullWidth 
          sx={{ 
            py: 1.5,
            borderColor: 'rgba(124,108,255,0.5)',
            color: '#7C6CFF',
            '&:hover': {
              borderColor: '#7C6CFF',
              backgroundColor: 'rgba(124,108,255,0.04)'
            }
          }} 
          onClick={onNavigateSignup}
        >
          회원가입하기
        </Button>
      </Stack>

      <Divider>또는</Divider>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleGoogle}
          sx={{
            width: 64,
            height: 64,
            minWidth: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Box component="img" src={googleLogo} alt="Google" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
        </Button>
      </Box>
    </Stack>
  )
}

