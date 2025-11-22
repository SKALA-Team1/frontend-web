import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

export default function RoleplayCTACard({ onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'white',
        cursor: 'pointer',
        justifyItems: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <CardContent>
        <Typography variant="subtitle1" sx={{ color: 'common.white', fontWeight: 700 }}>
          내 상황에 딱 맞는 롤플레잉
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
          롤플레이 상황을 만들어보세요.
        </Typography>
      </CardContent>
    </Card>
  )
}

