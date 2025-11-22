import React from 'react'
import { Avatar, Card, CardContent, Typography, Stack, Box } from '@mui/material'
import bookmarkedSentences from '../../../data/myPageBookmarks.json'

const statCardSx = {
  flex: 1,
  p: 2,
  borderRadius: 3,
  border: '1px solid rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5
}

export default function ProfileSummary() {
  return (
    <Card
      variant="outlined"
      sx={{
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.15)' }}>SK</Avatar>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h6" fontWeight={700}>SKALA 님</Typography>
              <Typography variant="body2" color="text.primary">SW Engineering · 7일 연속 학습 중</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={statCardSx}>
              <Typography variant="caption" color="text.primary">완료 롤플레잉</Typography>
              <Typography variant="h6" fontWeight={700}>24개</Typography>
            </Box>
            <Box sx={statCardSx}>
              <Typography variant="caption" color="text.primary">북마크한 문장</Typography>
              <Typography variant="h6" fontWeight={700}>{bookmarkedSentences.length}개</Typography>
            </Box>
            <Box sx={statCardSx}>
              <Typography variant="caption" color="text.primary">평균 평가 점수</Typography>
              <Typography variant="h6" fontWeight={700}>88점</Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

