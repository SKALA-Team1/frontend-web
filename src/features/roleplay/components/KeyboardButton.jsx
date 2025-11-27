import React from 'react'
import { IconButton } from '@mui/material'
import KeyboardIcon from '@mui/icons-material/Keyboard'

export default function KeyboardButton({ onClick, isActive = false }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        border: '1px solid rgba(255,255,255,0.2)',
        backgroundColor: isActive ? 'rgba(124,108,255,0.2)' : 'rgba(255,255,255,0.04)',
        color: '#F5F6FF',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(124,108,255,0.3)' : 'rgba(255,255,255,0.08)'
        }
      }}
      aria-label="키보드 입력"
    >
      <KeyboardIcon sx={{ fontSize: 20 }} />
    </IconButton>
  )
}

