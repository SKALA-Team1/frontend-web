import React from 'react'
import { Typography, Stack, Box } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import useLearnPage from '../hooks/useLearnPage'
import LearnChapterList from '../components/LearnChapterList'

export default function LearnPage() {
  const { chapters } = useLearnPage()

  return (
    <Stack spacing={3}>
      {/* 헤더 섹션 */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
          <SchoolIcon sx={{ fontSize: 24, color: '#6C63FF' }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121' }}>
            학습
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(245,246,255,0.8)',
            lineHeight: 1.6
          }}
        >
          체계적인 커리큘럼으로 영어 실력을 향상시켜보세요
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(245,246,255,0.6)',
            mt: 1
          }}
        >
          총 10개의 챕터, 각 챕터는 3개의 레슨으로 구성됩니다
        </Typography>
      </Box>

      <LearnChapterList chapters={chapters} />
    </Stack>
  )
}


