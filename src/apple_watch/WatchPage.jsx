import React, { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'
import MicIcon from '@mui/icons-material/Mic'
import appLogo from '../images/skuse_me.png'

// 애플워치 45mm 크기: 448x368px
const WATCH_WIDTH = 410
const WATCH_HEIGHT = 450

export default function WatchPage() {
  const [isRecording, setIsRecording] = useState(true) // 기본값을 true로 설정 (녹음 중 상태)

  const handleMicClick = () => {
    setIsRecording(!isRecording)
  }

  return (
    <Box
      sx={{
        width: WATCH_WIDTH,
        height: WATCH_HEIGHT,
        backgroundColor: '#05060A',
        position: 'relative',
        overflow: 'visible', // 로고가 잘리지 않도록
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 1.5 // 덜 둥글게
      }}
    >
      {/* 앱 로고 (맨 위) */}
      <Box
        sx={{
          position: 'absolute',
          top: -30, // 더 위로 올리기
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          component="img"
          src={appLogo}
          alt="앱 로고"
          sx={{
            width: 184,
            height: 184,
            objectFit: 'contain',
            mt: 0
          }}
          onError={(e) => {
            // 이미지 로드 실패 시 기본 배경색만 표시
            e.target.style.display = 'none'
          }}
        />
      </Box>

      {/* 마이크 버튼 (하단 중앙) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 150,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <IconButton
          onClick={handleMicClick}
          sx={{
            width: 80,
            height: 80,
            backgroundColor: isRecording
              ? 'rgba(255,82,82,0.9)'
              : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '2px solid',
            borderColor: isRecording
              ? 'rgba(255,82,82,1)'
              : 'rgba(255,255,255,0.3)',
            color: isRecording ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
            boxShadow: isRecording
              ? '0 0 25px rgba(255,82,82,0.6)'
              : '0 4px 20px rgba(0,0,0,0.4)',
            '&:hover': {
              backgroundColor: isRecording
                ? 'rgba(255,82,82,1)'
                : 'rgba(255,255,255,0.15)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {isRecording ? (
            <MicIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
          ) : (
            <MicNoneIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }} />
          )}
        </IconButton>
      </Box>
    </Box>
  )
}
