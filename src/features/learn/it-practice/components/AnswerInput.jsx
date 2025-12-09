import React from 'react'
import { Box, TextField, Button } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

/**
 * 답변 입력 컴포넌트
 */
export default function AnswerInput({ value, onChange, onSubmit, loading, disabled }) {
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
        placeholder="여기에 답변을 작성하세요... (Ctrl/Cmd + Enter로 제출)"
        disabled={disabled || loading}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={disabled || loading || !value.trim()}
          endIcon={<SendIcon />}
          size="large"
        >
          {loading ? '평가 중...' : '제출하고 평가받기'}
        </Button>
      </Box>
    </Box>
  )
}
