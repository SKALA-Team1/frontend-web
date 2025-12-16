import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'
import KeyboardButton from './KeyboardButton'

export default function MicButton({ 
  onClick, 
  isRecording = false,
  onKeyboardToggle,
  isKeyboardMode = false
}) {
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        py: 1, 
        minHeight: 88 
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* 녹음 중 텍스트 - 버튼 위쪽에 고정 */}
        {isRecording && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute',
              bottom: '100%',
              mb: 0.75,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.85)',
              whiteSpace: 'nowrap'
            }}
          >
            녹음 중
          </Typography>
        )}
        {/* 마이크 버튼 - 위치 고정 */}
        <IconButton
          color="primary"
          onClick={onClick}
          sx={{
            width: 64,
            height: 64,
            border: 'none',
            background: isRecording 
              ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)' 
              : 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
            color: '#FFFFFF',
            borderRadius: '50%',
            boxShadow: 'none',
            transition: 'transform 0.15s ease',
            '&:hover': { background: isRecording 
              ? 'linear-gradient(135deg, #FF7B7B 0%, #FF6262 100%)' 
              : 'linear-gradient(135deg, #8B7DFF 0%, #5B4DFF 100%)' },
            '&:active': { transform: 'scale(0.97)' }
          }}
          aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
        >
          <MicNoneIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {!isKeyboardMode && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateX(90px)'
          }}
        >
          <KeyboardButton 
            onClick={onKeyboardToggle} 
            isActive={false}
          />
        </Box>
      )}
    </Box>
  )
}
