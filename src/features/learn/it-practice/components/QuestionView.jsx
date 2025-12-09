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
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Chip label={question.category} color="primary" size="small" />
        <Chip
          label={getDifficultyLabel(question.difficulty)}
          color={getDifficultyColor(question.difficulty)}
          size="small"
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {question.questionText}
      </Typography>

      {question.questionTextEn && question.questionTextEn !== question.questionText && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {question.questionTextEn}
        </Typography>
      )}
    </Paper>
  )
}
