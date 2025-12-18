import React from 'react'
import { Box, Typography, Chip } from '@mui/material'

/**
 * IT 질문 표시 컴포넌트
 */
export default function QuestionView({ question }) {
  if (!question) return null

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움'
      case 'MEDIUM':
        return '보통'
      case 'HARD':
        return '어려움'
      default:
        return difficulty
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        p: 3,
        mb: 3
      }}
    >
      {/* 영어 질문 (크게, 먼저) */}
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 1.5, 
          fontWeight: 600, 
          lineHeight: 1.4,
          fontSize: '1.25rem',
          color: '#212121'
        }}
      >
        {question.questionTextEn || question.questionText}
      </Typography>

      {/* 한국어 번역 (작게, 아래) */}
      {question.questionText && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            fontStyle: 'italic',
            fontSize: '0.875rem'
          }}
        >
          {question.questionText}
        </Typography>
      )}

      {/* 카테고리 & 난이도 칩 */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip 
          label={question.category} 
          size="small"
          sx={{
            backgroundColor: 'rgba(124,108,255,0.2)',
            color: '#7C6CFF',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
        <Chip
          label={getDifficultyLabel(question.difficulty)}
          size="small"
          sx={{
            backgroundColor: 'rgba(124,108,255,0.2)',
            color: '#7C6CFF',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      </Box>
    </Box>
  )
}
