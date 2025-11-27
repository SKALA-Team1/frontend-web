import React from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'
import KeyboardButton from './KeyboardButton'

export default function MicButton({ 
  onClick, 
  isRecording = false,
  onKeyboardToggle,
  isKeyboardMode = false
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {isKeyboardMode && (
          <KeyboardButton 
            onClick={onKeyboardToggle} 
            isActive={isKeyboardMode}
          />
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isRecording && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.85)',
                mb: 0.5
              }}
            >
              녹음 중
            </Typography>
        )}
        <IconButton
          color="primary"
          onClick={onClick}
          sx={{
            width: 56,
            height: 56,
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: isRecording 
              ? 'rgba(124,108,255,0.3)' 
              : 'rgba(255,255,255,0.04)',
            color: '#F5F6FF',
            '&:hover': {
              backgroundColor: isRecording 
                ? 'rgba(124,108,255,0.4)' 
                : 'rgba(255,255,255,0.08)'
            }
          }}
          aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
        >
          <MicNoneIcon sx={{ fontSize: 24 }} />
        </IconButton>
        </Box>
        {!isKeyboardMode && (
          <KeyboardButton 
            onClick={onKeyboardToggle} 
            isActive={false}
          />
        )}
      </Stack>
    </Box>
  )
}

