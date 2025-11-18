import React from 'react'
import { Box, Typography, Button, IconButton, Stack } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import Lottie from 'lottie-react'

export default function SessionView({
  selectedTitle,
  messages,
  bottomRef,
  onEndSession,
  onOpenPanel
}) {
  return (
    <Box
      sx={{
        mt: 2,
        height: { xs: 'calc(100dvh - 64px)', sm: 'calc(100dvh - 64px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: 72 }} />
        <Typography variant="h6" align="center" sx={{ fontWeight: 700, flex: 1 }}>
          {selectedTitle || 'Roleplay'}
        </Typography>
        <Button size="small" variant="outlined" onClick={onEndSession}>
          종료
        </Button>
      </Box>

      {/* 반응형 아바타 창 */}
      <Box sx={{ width: '100%', mb: 1 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'common.white'
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <Lottie loop autoplay style={{ width: '100%', height: '100%' }} />
          </Box>
        </Box>
      </Box>

      {/* 채팅 내역 */}
      <Stack
        spacing={1}
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 1
        }}
      >
        {messages.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: m.who === 'You' ? 'flex-end' : 'flex-start' }}>
            <Box
              sx={{
                maxWidth: '80%',
                bgcolor: m.who === 'You' ? 'grey.900' : 'grey.100',
                color: m.who === 'You' ? 'common.white' : 'text.primary',
                px: 1.5,
                py: 1,
                borderRadius: 2
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.7 }}>{m.who}</Typography>
              <Typography variant="body2">{m.text}</Typography>
            </Box>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Stack>

      {/* 입력 영역 - 마이크 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <IconButton color="primary" sx={{ width: 56, height: 56, border: '1px solid', borderColor: 'divider' }}>
          <MicNoneIcon />
        </IconButton>
      </Box>

      {/* 우측 패널 토글 버튼 */}
      <IconButton
        onClick={onOpenPanel}
        sx={{
          position: 'fixed',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
        aria-label="추천 패널 열기"
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
    </Box>
  )
}


