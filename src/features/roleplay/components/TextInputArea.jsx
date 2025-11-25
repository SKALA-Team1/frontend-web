import React from 'react'
import { Box, TextField, IconButton, Stack } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MicNoneIcon from '@mui/icons-material/MicNone'
import KeyboardButton from './KeyboardButton'

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
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0 0 12px 12px'
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
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
              color: '#F5F6FF',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.18)'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.3)'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6C63FF'
              }
            },
            '& .MuiInputBase-input': {
              color: '#F5F6FF',
              '&::placeholder': {
                color: 'rgba(245,246,255,0.5)',
                opacity: 1
              }
            }
          }}
        />
        <IconButton
          onClick={onSend}
          disabled={!value.trim()}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: value.trim() ? 'rgba(124,108,255,0.3)' : 'rgba(255,255,255,0.04)',
            color: value.trim() ? '#F5F6FF' : 'rgba(245,246,255,0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              backgroundColor: value.trim() ? 'rgba(124,108,255,0.4)' : 'rgba(255,255,255,0.08)'
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.1)'
            }
          }}
          aria-label="전송"
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
      <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
        <IconButton
          onClick={onMicToggle}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: '#F5F6FF',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)'
            }
          }}
          aria-label="마이크"
        >
          <MicNoneIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <KeyboardButton 
          onClick={onKeyboardToggle} 
          isActive={isKeyboardMode}
        />
      </Stack>
    </Box>
  )
}

