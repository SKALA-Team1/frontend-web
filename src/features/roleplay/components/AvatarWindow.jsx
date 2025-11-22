import React from 'react'
import { Box } from '@mui/material'
import Lottie from 'lottie-react'

export default function AvatarWindow() {
  return (
    <Box sx={{ width: '100%', mb: 2, px: 1 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.02)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <Lottie loop autoplay style={{ width: '100%', height: '100%' }} />
        </Box>
      </Box>
    </Box>
  )
}

