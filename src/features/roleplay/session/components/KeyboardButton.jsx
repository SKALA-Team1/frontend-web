import React from 'react'
import { IconButton } from '@mui/material'
import KeyboardIcon from '@mui/icons-material/Keyboard'

export default function KeyboardButton({ onClick, isActive = false }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: 44,
        height: 44,
        border: isActive ? '2px solid #7C6CFF' : '1.5px solid rgba(124,108,255,0.2)',
        backgroundColor: isActive 
          ? '#FFFFFF' 
          : '#FFFFFF',
        color: '#7C6CFF',
        borderRadius: 1.25,
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#f5f5f5',
          borderColor: '#7C6CFF',
          transform: 'none',
          boxShadow: 'none'
        }
      }}
      aria-label="키보드 입력"
    >
      <KeyboardIcon sx={{ fontSize: 22 }} />
    </IconButton>
  )
}
