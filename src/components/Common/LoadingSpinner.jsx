/**
 * 로딩 스피너
 * 
 * 역할:
 * - Lazy Loading 중 표시할 로딩 화면
 */

import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingSpinner({ message = '로딩 중...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}



























