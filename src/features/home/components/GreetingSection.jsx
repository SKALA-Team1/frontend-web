import React from 'react'
import { Stack, Avatar, Box, Typography } from '@mui/material'

export default function GreetingSection() {
  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.125rem' }}>S</Avatar>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>SKALA님</Typography>
        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>연속 학습 7 일째</Typography>
      </Box>
    </Stack>
  )
}

