import React from 'react'
import { Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function SessionHeader({ title, onEndSession }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const displayTitle = title || 'Roleplay'

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
      <IconButton
        size="small"
        onClick={onEndSession}
        aria-label="세션 종료"
        sx={{
          border: '1px solid rgba(0,0,0,0.35)',
          borderRadius: '4px',
          width: 40,
          height: 36,
          mr: 1,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.06)'
          }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0
        }}
      >
        <Typography 
          variant="h6" 
          align="center" 
          noWrap
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.9375rem',
            color: '#212121',
            maxWidth: '100%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {displayTitle}
        </Typography>
      </Box>

      <Box sx={{ width: isDesktop ? 40 : 40 }} />
    </Box>
  )
}
