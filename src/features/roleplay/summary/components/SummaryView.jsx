import React, { useState, useEffect } from 'react'
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
  Collapse,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getComprehensiveFeedback } from '../../../../services/roleplayService'
import LoadingSpinner from '../../../../components/Common/LoadingSpinner'

const normalizeConversationMessages = (rawMessages = []) => {
  if (!Array.isArray(rawMessages)) return []
  return rawMessages
    .filter((msg) => {
      const who = msg?.who
      const text = typeof msg?.text === 'string' ? msg.text.trim() : ''
      return (who === 'AI' || who === 'You' || who === 'USER') && text.length > 0
    })
    .map((msg) => ({
      ...msg,
      who: msg.who === 'USER' ? 'You' : msg.who,
      text: msg.text.trim()
    }))
}

export default function SummaryView({
  messages,
  onClose,
  scenarioTitle = '롤플레잉 시나리오',
  sessionId = null
}) {
  const [isConversationOpen, setIsConversationOpen] = React.useState(true)
  const [isLongOpen, setIsLongOpen] = React.useState(false)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const normalizedMessages = normalizeConversationMessages(messages)
  const displayMessages = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION

  // 종합 피드백 조회 (피드백 생성 완료까지 대기)
  useEffect(() => {
    if (!sessionId) {
      console.warn('[SummaryView] sessionId가 없어 피드백을 조회할 수 없습니다.')
      return
    }

    let pollCount = 0
    const MAX_POLLS = 20 // 최대 20번 폴링 (약 40초)
    const POLL_INTERVAL = 2000 // 2초마다 조회

    const pollFeedback = async () => {
      setLoading(true)
      setError(null)
      
      const tryPoll = async () => {
        try {
          const feedbackData = await getComprehensiveFeedback(sessionId)
          console.log('[SummaryView] 피드백 응답 데이터:', feedbackData)
          console.log('[SummaryView] 피드백 필드 확인:', {
            avgPronunciation: feedbackData?.avgPronunciation,
            avgPronunciaition: feedbackData?.avgPronunciaition,
            avgGrammar: feedbackData?.avgGrammar,
            avgRelevance: feedbackData?.avgRelevance,
            feedbackShort: feedbackData?.feedbackShort,
            feedback_short: feedbackData?.feedback_short,
            feedbackLong: feedbackData?.feedbackLong,
            feedback_long: feedbackData?.feedback_long
          })
          setFeedback(feedbackData)
          setLoading(false)
        } catch (err) {
          // 404 에러면 피드백이 아직 생성 중이므로 계속 폴링
          if (err.response?.status === 404 && pollCount < MAX_POLLS) {
            pollCount++
            setTimeout(tryPoll, POLL_INTERVAL)
          } else {
            console.error('[SummaryView] 피드백 조회 실패:', err)
            setError('피드백을 불러오는 중 오류가 발생했습니다.')
            setLoading(false)
          }
        }
      }

      tryPoll()
    }

    pollFeedback()
  }, [sessionId])

  // 피드백 데이터 (API 응답 또는 기본값)
  const avgPronunciation = feedback?.avgPronunciation ?? feedback?.avgPronunciaition ?? feedback?.avg_pronunciation ?? feedback?.avg_pronunciaition ?? null
  const avgGrammar = feedback?.avgGrammar ?? feedback?.avg_grammar ?? null
  const avgRelevance = feedback?.avgRelevance ?? feedback?.avg_relevance ?? null
  const shortFeedback = feedback?.feedbackShort ?? feedback?.feedback_short ?? ''
  const longFeedback = feedback?.feedbackLong ?? feedback?.feedback_long ?? ''

  // 로딩 중이거나 피드백이 없으면 전체 페이지 대신 로딩 스피너만 표시
  if (loading || !feedback) {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 }, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="종합 피드백을 생성하고 있습니다..." />
      </Box>
    )
  }

  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 } }}>
        <Alert severity="warning" sx={{ mb: 1 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
          닫기
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 } }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Stack spacing={0.5} alignItems="center" textAlign="center">
          <Typography variant="overline" sx={{ letterSpacing: 1.2, color: 'text.secondary' }}>
            롤플레잉 종합 피드백
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {scenarioTitle || '롤플레잉 시나리오'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            짧은 요약과 상세 피드백을 확인하고 대화 로그를 복기하세요.
          </Typography>
        </Stack>

        {/* 종합 피드백 */}
        <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(124,108,255,0.2)',
              background: 'linear-gradient(135deg, rgba(124,108,255,0.04) 0%, rgba(75,60,248,0.02) 100%)',
              boxShadow: '0 8px 24px rgba(124,108,255,0.12)'
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 점수 표시 */}
              {(avgPronunciation !== null || avgGrammar !== null || avgRelevance !== null) && (
                <>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      평균 점수
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {avgPronunciation !== null && (
                        <Chip
                          label={`발음: ${avgPronunciation}점`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124,108,255,0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                      {avgGrammar !== null && (
                        <Chip
                          label={`문법: ${avgGrammar}점`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124,108,255,0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                      {avgRelevance !== null && (
                        <Chip
                          label={`관련성: ${avgRelevance}점`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124,108,255,0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* 짧은 피드백 */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  짧은 버전
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {shortFeedback}
                </Typography>
              </Box>

              <Divider />

              {/* 긴 피드백 */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    긴 버전
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setIsLongOpen((prev) => !prev)}
                    sx={{ transform: isLongOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Collapse in={isLongOpen} timeout="auto" unmountOnExit>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {longFeedback}
                  </Typography>
                </Collapse>
              </Box>
            </CardContent>
          </Card>

        {/* 대화 로그 */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.03)'
              }
            }}
            onClick={() => setIsConversationOpen((prev) => !prev)}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              대화 로그
            </Typography>
            <IconButton
              size="small"
              sx={{
                color: 'text.primary',
                transition: 'transform 0.2s ease',
                transform: isConversationOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>

          <Collapse in={isConversationOpen} timeout="auto" unmountOnExit>
            <Stack spacing={1.5}>
              {displayMessages.map((msg, idx) => {
                const isUser = msg.who === 'You'
                return (
                  <Box key={`${msg.who}-${idx}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: isUser ? 'primary.main' : 'text.primary',
                          textTransform: 'uppercase'
                        }}
                      >
                        {isUser ? 'You' : 'AI'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{idx + 1}
                      </Typography>
                    </Stack>
                    <Card
                      variant="outlined"
                      sx={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        bgcolor: isUser ? 'rgba(124,108,255,0.08)' : 'rgba(0,0,0,0.03)',
                        border: isUser ? '1px solid rgba(124,108,255,0.25)' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 2,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                      }}
                    >
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.text}
                        </Typography>
                        {msg.translation && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                            {msg.translation}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )
              })}
            </Stack>
          </Collapse>
        </Box>

        <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
          닫기
        </Button>
      </Stack>
    </Box>
  )
}

// 더미 데이터
const MOCK_CONVERSATION = [
  { who: 'AI', text: 'What is your role in the project?' },
  { who: 'You', text: 'I handle frontend development and UX validation.' },
  { who: 'AI', text: 'How do you prioritize feature requests?' },
  { who: 'You', text: 'We use impact vs. effort scoring and run quick user tests.' }
]
