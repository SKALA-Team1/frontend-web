import React, { useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Button
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import RefreshIcon from '@mui/icons-material/Refresh'
import useItChatbot from '../hooks/useItChatbot'

/**
 * IT 챗봇 대화 뷰
 * @param {boolean} compact - 컴팩트 모드 (높이 제한)
 * @param {Object} currentQuestion - 현재 연습 중인 질문 컨텍스트
 */
export default function ChatView({ compact = false, currentQuestion = null }) {
  const {
    messages,
    inputMessage,
    loading,
    error,
    setInputMessage,
    sendMessage,
    reset
  } = useItChatbot(currentQuestion)

  const messagesEndRef = useRef(null)

  // 새 메시지 올 때마다 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 컴팩트 모드일 때는 Container 제거하고 높이 제한
  // Drawer 안에서는 항상 Box 사용
  const WrapperComponent = Box
  const wrapperProps = {
    sx: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      p: compact ? 0 : 2
    }
  }

  return (
    <WrapperComponent {...wrapperProps}>
      {/* 헤더 - Drawer 안에서는 헤더 제거 (PracticeView에서 처리) */}
      {messages.length > 0 && !compact && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<RefreshIcon />} onClick={reset} variant="outlined" size="small">
            새 대화
          </Button>
        </Box>
      )}

      {/* 메시지 영역 */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0, // flexbox에서 스크롤을 위해 필요
          ...(compact && { maxHeight: '400px', minHeight: '300px' })
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <SmartToyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              무엇이든 물어보세요!
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              예: REST API가 뭔가요?
            </Typography>
          </Box>
        ) : (
          <Box>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  mb: 3,
                  alignItems: 'flex-start'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: 36,
                    height: 36
                  }}
                >
                  {msg.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    {msg.role === 'user' ? '나' : 'IT 챗봇'}
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                      color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                  <SmartToyIcon />
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  답변 생성 중...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>
        )}
      </Paper>

      {/* 입력 영역 */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요."
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={loading || !inputMessage.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </WrapperComponent>
  )
}
