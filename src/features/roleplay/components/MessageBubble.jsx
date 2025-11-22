import React from 'react'
import { Box, Typography } from '@mui/material'

const MESSAGE_STYLES = {
  You: {
    bgcolor: 'rgba(124,108,255,0.25)',
    borderColor: 'rgba(124,108,255,0.4)',
    justifyContent: 'flex-end'
  },
  AI: {
    bgcolor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'flex-start'
  }
}

export default function MessageBubble({ message, index }) {
  const { who, text } = message
  const style = MESSAGE_STYLES[who] || MESSAGE_STYLES.AI

  return (
    <Box sx={{ display: 'flex', justifyContent: style.justifyContent, px: 1 }}>
      <Box
        sx={{
          maxWidth: '80%',
          bgcolor: style.bgcolor,
          color: '#F5F6FF',
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: `1px solid ${style.borderColor}`,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.8,
            fontWeight: 600,
            display: 'block',
            mb: 0.5
          }}
        >
          {who}
        </Typography>
        <Typography 
          variant="body2"
          sx={{
            lineHeight: 1.6,
            wordBreak: 'break-word'
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  )
}

