import React from 'react'
import { Card, CardContent, Typography, Stack, Box, Chip } from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'

export default function BookmarkList({ bookmarkedSentences }) {
  return (
    <Card
      variant="outlined"
      sx={{
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <BookmarkIcon fontSize="small" sx={{ color: '#63D7FF' }} />
          <Typography variant="subtitle1" fontWeight={700}>북마크한 문장</Typography>
        </Stack>
        <Stack spacing={3}>
          {bookmarkedSentences.map((item, idx) => (
            <Box
              key={item.id}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.02)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{item.scenario}</Typography>
                <Chip
                  label={`저장 ${idx + 1}`}
                  size="small"
                  sx={{
                    borderRadius: 999,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#F5F6FF'
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.primary">AI 질문</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{item.ai}</Typography>
              <Typography variant="caption" color="text.primary">내 답변</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{item.you}</Typography>
              <Typography variant="caption" color="text.primary">제안 문장</Typography>
              <Typography variant="body2">{item.suggestion}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

