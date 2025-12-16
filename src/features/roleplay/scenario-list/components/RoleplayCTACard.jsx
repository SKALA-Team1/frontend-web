import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

export default function RoleplayCTACard({ onClick }) {
  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={{
        background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        borderRadius: 1.5,
        boxShadow: '0 8px 32px rgba(124,108,255,0.4)',
        height: { xs: '88px', sm: '108px' },
        minHeight: { xs: '88px', sm: '108px' },
        width: '100%',
        maxWidth: '600px',
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(124,108,255,0.5)',
          '& .icon': {
            transform: 'rotate(90deg) scale(1.1)'
          }
        },
        '&:active': {
          transform: 'translateY(0)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }
      }}
    >
      <CardContent
        sx={{
          p: 0,
          px: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          '&:last-child': {
            pb: 0
          }
        }}
      >
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 0.5,
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}
          >
            내 상황에 딱 맞는 롤플레잉
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
            }}
          >
            롤플레이 상황을 만들어보세요
          </Typography>
        </Box>
        <Box
          className="icon"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
      </CardContent>
    </Card>
  )
}

