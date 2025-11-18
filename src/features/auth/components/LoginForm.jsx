import React from 'react'
import { Stack, TextField, Button, Divider, Box, Typography } from '@mui/material'
import useLoginForm from '../hooks/useLoginForm'
import googleLogo from '../../../images/google_logo.png'

export default function LoginForm({ onLogin, onGoogleLogin, onNavigateSignup }) {
  const { email, password, handleEmailChange, handlePasswordChange, handleSubmit } = useLoginForm(onLogin)

  const handleGoogle = () => {
    if (onGoogleLogin) {
      onGoogleLogin()
    } else if (onLogin) {
      onLogin({ email: '', password: '' })
    }
  }

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Typography variant="h5" fontWeight={700} align="center">로그인</Typography>

      <Stack spacing={1}>
        <TextField label="이메일" type="email" value={email} onChange={handleEmailChange} fullWidth />
        <TextField label="비밀번호" type="password" value={password} onChange={handlePasswordChange} fullWidth />
        <Button variant="contained" fullWidth sx={{ py: 1.5 }} onClick={handleSubmit}>이메일로 로그인</Button>
        <Button variant="outlined" fullWidth sx={{ py: 1.5 }} onClick={onNavigateSignup}>
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
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            bgcolor: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Box component="img" src={googleLogo} alt="Google" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
        </Button>
      </Box>
    </Stack>
  )
}

