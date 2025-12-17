import React from 'react'
import { Box, Stack } from '@mui/material'
import PracticeView from '../it-practice/components/PracticeView'

/**
 * 학습 메인 페이지
 * - IT 설명 연습 (챗봇 통합)
 */
export default function LearnPage() {
  return (
    <Stack spacing={2} sx={{ px: { xs: 0, sm: 0 }, minHeight: '100vh', bgcolor: 'background.default' }}>
      <PracticeView />
    </Stack>
  )
}
