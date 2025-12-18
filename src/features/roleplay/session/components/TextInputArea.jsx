import React from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'
import SendIcon from '@mui/icons-material/Send'

export default function TextInputArea({ 
  value, 
  onChange, 
  onSend,
  onKeyboardToggle,
  onMicToggle,
  isKeyboardMode = true,
  placeholder = "답변을 입력하세요...",
  showModeToggle = true // 모드 전환 버튼 표시 여부
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSend()
      }
    }
  }

  const handleSend = () => {
    if (value.trim()) {
      onSend()
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
        {showModeToggle && (
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
        )}
        <IconButton
          onClick={handleSend}
          disabled={!value.trim()}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: value.trim() ? '#6C63FF' : '#e0e0e0',
            color: value.trim() ? '#ffffff' : '#9e9e9e',
            '&:hover': {
              backgroundColor: value.trim() ? '#5B4DFF' : '#d5d5d5'
            },
            '&.Mui-disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e'
            }
          }}
          aria-label="전송"
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  )
}
