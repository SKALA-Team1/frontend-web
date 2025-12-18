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
    <Box sx={{ mb: 3, position: 'relative' }}>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="여기에 답변을 작성하세요."
        disabled={disabled || loading}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: 1.25,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(124,108,255,0.3)',
              borderWidth: 2
            },
            '&:hover': {
              backgroundColor: 'rgba(124,108,255,0.02)',
              '& fieldset': {
                borderColor: 'rgba(124,108,255,0.5)'
              }
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(124,108,255,0.06)',
              '& fieldset': {
                borderColor: '#7C6CFF',
                borderWidth: 2,
                boxShadow: '0 0 0 3px rgba(124,108,255,0.15)'
              }
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0,0,0,0.02)',
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.1)'
              }
            }
          },
          '& .MuiInputBase-input': {
            color: '#212121',
            fontSize: '0.9375rem',
            fontWeight: 500
          }
        }}
      />

      {/* 챗봇 토글 버튼 - 입력창 하단 오른쪽 플로팅 */}
      <Tooltip title="질문 도우미 열기">
        <IconButton
          onClick={onChatbotToggle}
          disabled={disabled || loading}
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 8,
            zIndex: 1,
            width: 40,
            height: 40,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(124,108,255,0.2)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
              border: '1px solid rgba(124,108,255,0.3)',
              boxShadow: '0 4px 12px rgba(124,108,255,0.2)',
            },
            '&:disabled': {
              bgcolor: 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.1)',
            }
          }}
        >
          <SmartToyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      {/* 평가받기 버튼 - 전체 너비 */}
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={false}
        fullWidth
        size="large"
        sx={{
          background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
          color: '#FFFFFF',
          textTransform: 'none',
          fontWeight: 600,
          py: 1.5,
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(124,108,255,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
            boxShadow: '0 6px 20px rgba(124,108,255,0.4)',
            color: '#FFFFFF'
          },
          '&:disabled': {
            background: 'rgba(124,108,255,0.3)',
            color: '#FFFFFF'
          }
        }}
      >
        {loading ? '평가 중...' : '평가받기'}
      </Button>
    </Box>
  )
}
