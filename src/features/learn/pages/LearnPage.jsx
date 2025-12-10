import React from 'react'
import { Box } from '@mui/material'
import PracticeView from '../it-practice/components/PracticeView'

/**
 * 학습 메인 페이지
 * - IT 설명 연습 (챗봇 통합)
 */
export default function LearnPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PracticeView />
    </Box>
  )
}
