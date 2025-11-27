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
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        height: { xs: '80px', sm: '100px' }, // 모바일 80px, 데스크톱 100px
        minHeight: { xs: '80px', sm: '100px' }, // 최소 높이
        width: '90%', // 모든 화면 크기에서 90% 너비 (일관된 비율)
        mx: 'auto' // 모든 화면 크기에서 중앙 정렬
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <CardContent
        sx={{
          py: { xs: 1.25, sm: 2 }, // 모바일 위아래 패딩 조정
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          '&:last-child': { pb: { xs: 1.25, sm: 2 } } // 마지막 자식 요소의 하단 패딩도 동일하게
        }}
      >
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'common.white', 
            fontWeight: 700,
            mb: { xs: 0.5, sm: 0.75 } // 텍스트 간 간격 조정
          }}
        >
          내 상황에 딱 맞는 롤플레잉
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
          롤플레이 상황을 만들어보세요.
        </Typography>
      </CardContent>
    </Card>
  )
}

