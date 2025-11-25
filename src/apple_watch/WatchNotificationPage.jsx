import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import appLogo from '../images/skuse_me.png'

// 애플워치 40mm 크기: 394x324px
const WATCH_WIDTH = 410
const WATCH_HEIGHT = 450

export default function WatchNotificationPage() {
  return (
    <Box
      sx={{
        width: WATCH_WIDTH,
        height: WATCH_HEIGHT,
        background: 'linear-gradient(135deg, rgba(20,20,30,0.9) 0%, rgba(10,10,20,0.9) 100%)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'visible', // 로고가 border를 넘어갈 수 있도록
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(255,255,255,0.15)',
        borderRadius: 1.5, // 덜 둥글게
        p: 2
      }}
    >
      {/* 모달 카드 */}
      <Card
        sx={{
          backgroundColor: 'rgba(17,19,26,0.98)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255,82,82,0.4)',
          borderRadius: 2, // 덜 둥글게
          boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1) inset',
          maxWidth: '90%',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(25,27,35,0.98) 0%, rgba(17,19,26,0.98) 100%)',
          position: 'relative',
          pt: 4, // 로고 공간 확보 (줄여서 내용을 위로 올림)
          overflow: 'visible' // 로고가 잘리지 않도록
        }}
      >
        {/* 앱 로고 (border 위에 걸치도록) */}
        <Box
          sx={{
            position: 'absolute',
            top: -120, // 로고 중앙(글자 부분)이 보더선과 일치하도록 (높이의 절반: 164/2 = 82)
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: 164,
            height: 164,
            backgroundColor: 'transparent',
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
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e) => {
              // 이미지 로드 실패 시 기본 배경색만 표시
              e.target.style.display = 'none'
            }}
          />
        </Box>

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            pt: 0 // 로고와의 간격 제거하여 위로 올림
          }}
        >
          {/* 알림 아이콘 */}
          <Box
            sx={{
              mb: 1.5, // 간격 줄임
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 48,
                color: '#FF5252'
              }}
            />
          </Box>

          {/* 시나리오 제목 */}
          <Typography
            variant="subtitle1"
            sx={{
              color: '#F5F6FF',
              fontWeight: 700,
              fontSize: '0.9375rem',
              mb: 1.5,
              lineHeight: 1.4,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              px: 1
            }}
          >
            배포 이슈 핫픽스 공지
          </Typography>

          {/* 알림 메시지 */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(245,246,255,0.8)',
              fontWeight: 500,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              px: 1
            }}
          >
            새로운 시나리오가 생성되었습니다
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

