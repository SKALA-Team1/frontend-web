import React from 'react'
import { Box, TextField, Button, IconButton, Tooltip } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'

/**
 * 답변 입력 컴포넌트
 */
export default function AnswerInput({ value, onChange, onSubmit, loading, disabled, onChatbotToggle }) {
  const handleKeyPress = (e) => {
    // Ctrl+Enter 또는 Cmd+Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSubmit()
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="여기에 답변을 작성하세요."
        disabled={disabled || loading}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
        {/* 챗봇 토글 버튼 */}
        <Tooltip title="질문 도우미 열기">
          <IconButton
            onClick={onChatbotToggle}
            disabled={disabled || loading}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(124,108,255,0.1)',
              border: '1px solid rgba(124,108,255,0.2)',
              '&:hover': {
                bgcolor: 'rgba(124,108,255,0.15)',
                border: '1px solid rgba(124,108,255,0.3)',
              },
              '&:disabled': {
                bgcolor: 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.1)',
              }
            }}
          >
            <SmartToyIcon sx={{ color: 'primary.main' }} />
          </IconButton>
        </Tooltip>

        {/* 제출 버튼 */}
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={disabled || loading || !value.trim()}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: '0 4px 16px rgba(124,108,255,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
              boxShadow: '0 6px 20px rgba(124,108,255,0.4)',
            },
            '&:disabled': {
              background: 'rgba(124,108,255,0.3)',
            }
          }}
        >
          {loading ? '평가 중...' : '평가받기'}
        </Button>
      </Box>
    </Box>
  )
}
