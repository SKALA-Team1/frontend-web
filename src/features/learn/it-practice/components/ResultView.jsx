import React from 'react'
import { Box, Typography, Paper, LinearProgress, Divider, Button } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

/**
 * 평가 결과 표시 컴포넌트
 */
export default function ResultView({ result, onTryAgain }) {
  if (!result) return null

  const ScoreBar = ({ label, score }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="600">
          {score}점
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 1,
            backgroundColor: score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336'
          }
        }}
      />
    </Box>
  )

  return (
    <Box>
      {/* 종합 점수 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          종합 점수
        </Typography>
        <Typography variant="h2" fontWeight="700">
          {result.scores.overall}점
        </Typography>
      </Paper>

      {/* 세부 점수 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          세부 평가
        </Typography>

        <ScoreBar label="명확성" score={result.scores.clarity} />
        <ScoreBar label="기술적 정확성" score={result.scores.technicalAccuracy} />
        <ScoreBar label="전문 용어 사용" score={result.scores.terminology} />
      </Paper>

      {/* 피드백 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          피드백
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {result.feedback}
        </Typography>
      </Paper>

      {/* 모범 답안 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          모범 답안
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {result.modelAnswer}
        </Typography>
      </Paper>

      {/* 다시 시도 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onTryAgain}
          startIcon={<RefreshIcon />}
          size="large"
        >
          다른 질문 연습하기
        </Button>
      </Box>
    </Box>
  )
}
