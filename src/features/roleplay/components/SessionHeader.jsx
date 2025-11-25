import React from 'react'
import { Box, Typography, Button } from '@mui/material'

export default function SessionHeader({ title, onEndSession }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        px: 1,
        py: 0
      }}
    >
      <Box sx={{ width: 72 }} />
      <Typography 
        variant="h6" 
        align="center" 
        sx={{ 
          fontWeight: 700, 
          flex: 1,
          fontSize: '0.9375rem',
          color: '#F5F6FF'
        }}
      >
        {title || 'Roleplay'}
      </Typography>
      <Button 
        size="small" 
        variant="outlined" 
        onClick={onEndSession}
        sx={{
          borderColor: 'rgba(255,255,255,0.3)',
          color: '#F5F6FF',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(255,255,255,0.08)'
          }
        }}
      >
        종료
      </Button>
    </Box>
  )
}

