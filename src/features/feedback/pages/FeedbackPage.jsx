import React, { useState, useEffect, lazy, Suspense } from 'react'
import { 
  Stack, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import { getCompletedSessions, getSessionUtterances } from '../../../services/roleplayService'
import LoadingSpinner from '../../../components/Common/LoadingSpinner'

const SummaryView = lazy(() => import('../../roleplay/summary/components/SummaryView'))

export default function FeedbackPage() {
  const [completedSessions, setCompletedSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionMessages, setSessionMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  // 완료된 세션 목록 로드
  useEffect(() => {
    const loadCompletedSessions = async () => {
      setLoading(true)
      setError(null)
      try {
        const sessions = await getCompletedSessions()
        setCompletedSessions(Array.isArray(sessions) ? sessions : [])
      } catch (err) {
        console.error('Failed to load completed sessions:', err)
        setError('완료된 세션 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadCompletedSessions()
  }, [])

  // 세션 선택 시 메시지 로드 및 SummaryView 표시
  const handleSessionClick = async (session) => {
    setSelectedSession(session)
    setLoadingMessages(true)
    try {
      const utterancesData = await getSessionUtterances(session.sessionId)
      const utterances = utterancesData?.utterances || []
      
      // utterances를 messages 형식으로 변환
      const messages = utterances.map(utterance => ({
        who: utterance.speaker === 'user' ? 'You' : 'AI',
        text: utterance.text || '',
        translation: utterance.question_ko || null
      }))
      
      setSessionMessages(messages)
    } catch (err) {
      console.error('Failed to load session messages:', err)
      alert('세션 메시지를 불러오는데 실패했습니다.')
      setSelectedSession(null)
    } finally {
      setLoadingMessages(false)
    }
  }

  // SummaryView 닫기
  const handleCloseSummary = () => {
    setSelectedSession(null)
    setSessionMessages([])
  }

  // 피드백 상세 화면 (SummaryView)
  if (selectedSession) {
    if (loadingMessages) {
      return (
        <Box sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 0, sm: 0 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      )
    }
    
    return (
      <Suspense fallback={<LoadingSpinner message="피드백 로딩 중..." />}>
        <SummaryView
          messages={sessionMessages}
          scenarioTitle={selectedSession.scenarioTitle}
          sessionId={selectedSession.sessionId}
          onClose={handleCloseSummary}
        />
      </Suspense>
    )
  }

  // 피드백 목록 화면
  if (loading) {
    return (
      <Box sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 0, sm: 0 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 0, sm: 0 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Stack spacing={1.5}>
      {/* 헤더 */}
      <Stack spacing={0.25} alignItems="center" textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          피드백
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.75 }}>
          완료된 롤플레잉의 피드백을 확인하세요
        </Typography>
      </Stack>

      {/* 피드백 카드 리스트 */}
      {completedSessions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            완료된 롤플레잉이 없습니다.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {completedSessions.map((session) => {
            // 실행 날짜 포맷팅
            const executedDate = session.executedDate 
              ? new Date(session.executedDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })
              : '날짜 정보 없음'

            return (
              <Card
                key={session.sessionId}
                onClick={() => handleSessionClick(session)}
                sx={{ 
                  borderRadius: 1.5,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: 'linear-gradient(180deg, #7C6CFF 0%, #4B3CF8 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(124,108,255,0.2)',
                    borderColor: 'rgba(124,108,255,0.3)',
                    transform: 'translateY(-4px)',
                    '&::before': {
                      opacity: 1
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Stack spacing={1}>
                    {/* 시나리오 제목 */}
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      sx={{ 
                        fontSize: '1.0625rem',
                        lineHeight: 1.4,
                        color: '#212121',
                        flex: 1
                      }}
                    >
                      {session.scenarioTitle}
                    </Typography>

                    {/* 구분선 */}
                    <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

                {/* 정보 섹션 */}
                <Stack spacing={0.75}>
                  {/* 나의 역할 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.125 }}>
                        나의 역할
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {session.myRole}
                      </Typography>
                    </Box>
                  </Box>

                  {/* AI 역할 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.125 }}>
                        AI 역할
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {session.aiRole}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 실행 날짜 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.6 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.125 }}>
                        실행 날짜
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.secondary">
                        {executedDate}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
