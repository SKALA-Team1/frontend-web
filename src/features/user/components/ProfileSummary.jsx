import React from 'react'
import { Avatar, Card, CardContent, Typography, Stack, Box } from '@mui/material'

export default function ProfileSummary() {
  const streakDays = 7

  return (
    <Card
      variant="outlined"
      sx={{
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            sx={{ 
              width: 72, 
              height: 72, 
              bgcolor: 'rgba(124,108,255,0.3)',
              border: '2px solid rgba(124,108,255,0.5)',
              fontSize: '1.5rem',
              fontWeight: 700
            }}
          >
            SK
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              SKALA 님
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600
                }}
              >
                🔥 {streakDays}일 연속 학습 중
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

