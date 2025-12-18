import React from 'react'
import { Box, Typography, Card, CardContent, LinearProgress, Divider, Button, Stack } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

/**
 * 평가 결과 표시 컴포넌트
 */
export default function ResultView({ result, onTryAgain }) {
  if (!result) return null

  const ScoreBar = ({ label, score }) => (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8125rem' }}>
          {score}점
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 6,
          borderRadius: 0.5,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 0.5,
            backgroundColor: score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336'
          }
        }}
      />
    </Box>
  )

  return (
    <Stack spacing={2}>
      {/* 종합 점수 */}
      <Card
        sx={{
          borderRadius: 1.5,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(124,108,255,0.1) 0%, rgba(75,60,248,0.08) 100%)',
          boxShadow: '0 2px 8px rgba(124,108,255,0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124,108,255,0.2)',
            borderColor: 'rgba(124,108,255,0.25)'
          }
        }}
      >
        <CardContent sx={{ 
          p: 1,
          textAlign: 'center',
          '&:last-child': {
            paddingBottom: 1
          }
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
            종합 점수
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight="700"
            sx={{
              background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            {result.scores.overall}점
          </Typography>
        </CardContent>
      </Card>

      {/* 세부 점수 */}
      <Card
        sx={{
          borderRadius: 1.5,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124,108,255,0.15)',
            borderColor: 'rgba(124,108,255,0.2)'
          }
        }}
      >
        <CardContent sx={{ 
          p: 1,
          '&:last-child': {
            paddingBottom: 1
          }
        }}>
          <Stack spacing={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.0625rem',
                lineHeight: 1.4,
                color: '#212121',
                mb: 0.5
              }}
            >
              세부 평가
            </Typography>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
            <ScoreBar label="명확성" score={result.scores.clarity} />
            <ScoreBar label="기술적 정확성" score={result.scores.technicalAccuracy} />
            <ScoreBar label="전문 용어 사용" score={result.scores.terminology} />
          </Stack>
        </CardContent>
      </Card>

      {/* 피드백 */}
      <Card
        sx={{
          borderRadius: 1.5,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124,108,255,0.15)',
            borderColor: 'rgba(124,108,255,0.2)'
          }
        }}
      >
        <CardContent sx={{ 
          p: 1,
          '&:last-child': {
            paddingBottom: 1
          }
        }}>
          <Stack spacing={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.0625rem',
                lineHeight: 1.4,
                color: '#212121'
              }}
            >
              피드백
            </Typography>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6,
                color: 'text.primary',
                fontSize: '0.875rem'
              }}
            >
              {result.feedback}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* 모범 답안 */}
      <Card
        sx={{
          borderRadius: 1.5,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124,108,255,0.15)',
            borderColor: 'rgba(124,108,255,0.2)'
          }
        }}
      >
        <CardContent sx={{ 
          p: 1,
          '&:last-child': {
            paddingBottom: 1
          }
        }}>
          <Stack spacing={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.0625rem',
                lineHeight: 1.4,
                color: '#212121'
              }}
            >
              모범 답안
            </Typography>
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6,
                color: 'text.primary',
                fontSize: '0.875rem'
              }}
            >
              {result.modelAnswer}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* 다시 시도 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Button
          variant="contained"
          onClick={onTryAgain}
          startIcon={<RefreshIcon />}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: '0 4px 16px rgba(124,108,255,0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
              boxShadow: '0 6px 20px rgba(124,108,255,0.4)',
            }
          }}
        >
          다른 질문 연습하기
        </Button>
      </Box>
    </Stack>
  )
}
