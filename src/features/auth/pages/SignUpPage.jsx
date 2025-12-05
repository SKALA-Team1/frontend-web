import React from 'react'
import { Box } from '@mui/material'
import useSignupForm from '../hooks/useSignupForm'
import SignUpForm from '../components/SignUpForm.jsx'
import { useNavigate } from 'react-router-dom'
import Notification from '../../../components/Common/Notification.jsx'
import useNotification from '../../../hooks/useNotification.js'

export default function SignUpPage() {
  const navigate = useNavigate()
  const notification = useNotification()
  const signup = useSignupForm(() => navigate('/login'), notification)

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        <SignUpForm
          {...signup}
          onNavigateLogin={() => navigate('/login')}
        />
      </Box>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={notification.closeNotification}
      />
    </Box>
  )
}

