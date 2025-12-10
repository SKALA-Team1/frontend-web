import React from 'react'
import { Box, Typography, Chip, Paper } from '@mui/material'

/**
 * IT 질문 표시 컴포넌트
 */
export default function QuestionView({ question }) {
  if (!question) return null

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'success'
      case 'MEDIUM':
        return 'warning'
      case 'HARD':
        return 'error'
      default:
        return 'default'
    }
  }

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
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* 영어 질문 (크게, 먼저) */}
      <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600, lineHeight: 1.4 }}>
        {question.questionTextEn || question.questionText}
      </Typography>

      {/* 한국어 번역 (작게, 아래) */}
      {question.questionText && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          {question.questionText}
        </Typography>
      )}

      {/* 카테고리 & 난이도 칩 */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip label={question.category} color="primary" size="small" />
        <Chip
          label={getDifficultyLabel(question.difficulty)}
          color={getDifficultyColor(question.difficulty)}
          size="small"
        />
      </Box>
    </Paper>
  )
}
