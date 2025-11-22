import React from 'react'
import { Card, CardContent, Typography, Stack, Box, Button } from '@mui/material'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'

export default function RecordingList({ recordings }) {
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
          <PlayCircleOutlineIcon fontSize="small" sx={{ color: '#FFB347' }} />
          <Typography variant="subtitle1" fontWeight={700}>대화 녹음 다시 듣기</Typography>
        </Stack>
        <Stack spacing={2.5}>
          {recordings.map((record) => (
            <Box
              key={record.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                p: 1.5
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>{record.title}</Typography>
                <Typography variant="caption" color="text.primary">
                  {record.date} · {record.duration}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{ borderColor: 'rgba(255,255,255,0.35)', color: '#F5F6FF' }}
                >
                  재생
                </Button>
                <Button variant="text" size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>다운로드</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

