import React from 'react'
import { Typography, Stack, Box, Chip } from '@mui/material'

export default function BookmarkList({ bookmarkedSentences }) {
  return (
    <Stack spacing={2}>
      {bookmarkedSentences.map((item, idx) => (
        <Box
          key={item.id}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(124,108,255,0.3)'
            }
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#F5F6FF' }}>
              {item.scenario}
            </Typography>
            <Chip
              label={`#${idx + 1}`}
              size="small"
              sx={{
                borderRadius: 1,
                backgroundColor: 'rgba(124,108,255,0.2)',
                color: '#6C63FF',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20
              }}
            />
          </Stack>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                AI 질문
              </Typography>
              <Typography variant="body2" sx={{ color: '#F5F6FF', fontSize: '0.8125rem' }}>
                {item.ai}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                내 답변
              </Typography>
              <Typography variant="body2" sx={{ color: '#F5F6FF', fontSize: '0.8125rem' }}>
                {item.you}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'rgba(124,108,255,0.1)',
                border: '1px dashed rgba(124,108,255,0.3)'
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                제안 문장
              </Typography>
              <Typography variant="body2" sx={{ color: '#F5F6FF', fontSize: '0.8125rem' }}>
                {item.suggestion}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
