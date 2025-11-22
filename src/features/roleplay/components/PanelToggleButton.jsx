import React from 'react'
import { IconButton } from '@mui/material'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'

export default function PanelToggleButton({ onClick }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'fixed',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 44,
        height: 44,
        border: '1px solid rgba(255,255,255,0.2)',
        bgcolor: 'rgba(255,255,255,0.08)',
        color: '#F5F6FF',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.15)',
          borderColor: 'rgba(255,255,255,0.3)'
        }
      }}
      aria-label="추천 패널 열기"
    >
      <KeyboardArrowLeftIcon sx={{ fontSize: 22 }} />
    </IconButton>
  )
}

