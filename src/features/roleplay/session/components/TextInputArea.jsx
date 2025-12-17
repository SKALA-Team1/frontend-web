import React from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'

export default function TextInputArea({ 
  value, 
  onChange, 
  onSend,
  onKeyboardToggle,
  onMicToggle,
  isKeyboardMode = true,
  placeholder = "답변을 입력하세요..." 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSend()
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1.5,
        backgroundColor: 'transparent',
        borderTop: 'none',
        borderRadius: 0
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              borderRadius: 1,
              color: '#212121',
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.23)'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0,0,0,0.4)'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6C63FF'
              }
            },
            '& .MuiInputBase-input': {
              color: '#212121',
              '&::placeholder': {
                color: 'rgba(245,246,255,0.5)',
                opacity: 1
              }
            }
          }}
        />
        <IconButton
          onClick={onMicToggle}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#ffffff',
            color: '#212121',
            border: '1px solid rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
          aria-label="음성 모드로 전환"
        >
          <MicNoneIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  )
}
