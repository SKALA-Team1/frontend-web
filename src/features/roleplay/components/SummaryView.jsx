import React from 'react'
import { 
  Stack, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Chip,
  IconButton,
  Divider,
  Collapse
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { generateSuggestion } from '../../../utils/suggestionGenerator.js'

// Mock 데이터 구조 (나중에 백엔드 연동 시 교체)
const MOCK_PRONUNCIATION_SCORES = {
  accuracy: 85,
  fluency: 78,
  prosody: 82
}

const MOCK_FEEDBACK_DATA = {
  overall: {
    summary: "전반적으로 명확한 발음과 안정적인 리듬을 보여주셨습니다. 다만 모음 길이에서 일관성이 부족하고, 복합문에서 연결사 사용이 반복되는 경향이 있습니다.",
    weaknesses: [
      "모음 길이 일관성 부족",
      "복합문 연결사 다양성 부족",
      "완곡한 제안과 확정적 제안 구분 필요"
    ],
    tips: [
      "다음 대화에서는 원인 가설 제시 → 근거 제시 → 실행 제안의 구조를 유지하세요.",
      "숫자/시간 단위를 명시해 설득력을 강화하세요.",
      "다양한 연결사 패턴을 사용해보세요."
    ],
    examples: [
      "Instead of: 'We should fix this.'",
      "Try: 'Given the current situation, I recommend we address this issue by next week.'"
    ]
  },
  utterances: [] // 각 발화별 피드백은 messages와 매핑됨
}

// 더미 대화 데이터 (홀수: AI, 짝수: 사용자)
const MOCK_CONVERSATION = [
  { who: 'AI', text: 'Can you summarize the root cause of the /reports endpoint error after enabling finance advanced filters?' },
  { who: 'You', text: 'We\'ve identified the root cause. The issue is in the report generation module where we\'re not properly handling the new finance filters. We\'re implementing a temporary workaround by caching the filter results, and this should resolve the immediate issue. We expect to have a permanent fix by next week.' },
  { who: 'AI', text: 'Can you elaborate on how the caching workaround affects the performance and scalability of our reports endpoint when handling complex finance filters?' },
  { who: 'You', text: 'The caching workaround improves the report performance with complex finance filters, but it may increase memory usage and risks serving stale data. It helps short-term, but we need a more scalable fix soon.' },
  { who: 'AI', text: 'Can you elaborate on how you envision the new permanent fix to address both performance and scalability issues with the reports endpoint when handling complex finance filters?' },
  { who: 'You', text: 'For the permanent fix, we will optimize the filter logic and add proper indexing/query tuning so complex filters run faster. We\'ll also design the cache/DB flow to scale safely without growing memory too much.' },
  { who: 'AI', text: 'How do you plan to validate and test the effectiveness of the proposed indexing/query tuning for complex finance filters before integrating it into our production environment?' },
  { who: 'You', text: 'We\'ll test it first on staging with real-like finance filter cases and compare latency/DB load before vs after. If the results look stable, we\'ll roll it out gradually to production.' },
  { who: 'AI', text: 'How do you plan to implement a temporary workaround for the Redis connection pool issues, and what\'s the expected impact on system performance?' },
  { who: 'You', text: 'We\'ll temporarily reduce Redis pool usage by limiting concurrent connections and adding simple retries with backoff. This may slightly increase latency under high load, but should prevent timeouts and stabilize the system.' },
  { who: 'AI', text: 'Can you elaborate on how you envision implementing the Redis connection pool issues fix to ensure that it does not introduce any cascading performance impacts on other system components?' },
  { who: 'You', text: 'We\'ll fix the pool by setting safe max connections/timeouts and testing under load to check other services aren\'t slowed down. Then we\'ll roll it out step-by-step with monitoring so we can catch any side effects early.' },
  { who: 'AI', text: 'Can you walk me through how the roll-out of this temporary fix to production will be structured and what key performance indicators (KPIs) you plan to track during that process?' },
  { who: 'You', text: 'We\'ll deploy the temporary fix gradually (canary → small % → full) while watching the system. We\'ll track Redis error rate, request latency, throughput, and CPU/memory to make sure it stays stable.' },
  { who: 'AI', text: 'Can you elaborate on how you plan to handle any potential performance regressions or unexpected side effects that might arise from the gradual roll-out of this temporary fix, and what additional monitoring or logging would be required to ensure a smooth transition?' },
  { who: 'You', text: 'If we see regressions, we\'ll pause or roll back the canary and check logs/metrics to find the cause. We\'ll add extra monitoring for Redis timeouts, pool usage, and endpoint latency, plus detailed error logs during rollout.' },
  { who: 'AI', text: 'Can you explain how you envision the process of analyzing and addressing potential root causes for performance regressions during the roll-out phase would be structured to ensure timely resolution?' },
  { who: 'You', text: 'We\'ll check alerts first, then compare metrics before/after the rollout to spot what changed. If needed, we\'ll reproduce it on staging, fix the specific part, and redeploy quickly.' },
  { who: 'AI', text: 'What are the next steps to resolve the issue, and when can we expect a fix or further updates from your team?' },
  { who: 'You', text: 'We\'re wrapping up the fix now and will run final tests soon. You can expect an update shortly, and we plan to deliver the final patch within the next few days.' }
]

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
  summaryTab,
  setSummaryTab,
  messages,
  bookmarked,
  toggleBookmark,
  onClose,
  scenarioTitle = '롤플레잉 시나리오'
}) {
  const [isConversationOpen, setIsConversationOpen] = React.useState(false)
  
  const normalizedMessages = normalizeConversationMessages(messages)
  const displayMessages = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION
  const scenarioLabel = scenarioTitle || '롤플레잉 시나리오'
  
  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 } }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Stack spacing={0.5} alignItems="center" textAlign="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            피드백
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.75 }}>
            롤플레잉 세션에 대한 상세 피드백을 확인하세요
          </Typography>
        </Stack>

        {/* 🎤 발음 평가 요약 */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
            발음 평가 요약
          </Typography>
          <Stack 
            direction={{ xs: 'row', sm: 'row' }} 
            spacing={1.5}
            sx={{ 
              overflowX: { xs: 'auto', sm: 'visible' },
              pb: { xs: 1, sm: 0 },
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {/* 정확도 카드 */}
            <Card 
              variant="outlined" 
              sx={{ 
                minWidth: { xs: '30%', sm: 'auto' },
                flex: { xs: '0 0 auto', sm: 1 },
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {MOCK_PRONUNCIATION_SCORES.accuracy}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  정확도
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Accuracy
                </Typography>
              </CardContent>
            </Card>

            {/* 유창성 카드 */}
            <Card 
              variant="outlined"
              sx={{ 
                minWidth: { xs: '30%', sm: 'auto' },
                flex: { xs: '0 0 auto', sm: 1 },
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {MOCK_PRONUNCIATION_SCORES.fluency}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  유창성
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Fluency
                </Typography>
              </CardContent>
            </Card>

            {/* 억양강세 카드 */}
            <Card 
              variant="outlined"
              sx={{ 
                minWidth: { xs: '30%', sm: 'auto' },
                flex: { xs: '0 0 auto', sm: 1 },
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {MOCK_PRONUNCIATION_SCORES.prosody}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  억양·강세
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Prosody
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* 🗨️ 대화 로그 */}
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
                bgcolor: 'rgba(255,255,255,0.03)'
              }
            }}
            onClick={() => setIsConversationOpen(!isConversationOpen)}
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
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          <Collapse in={isConversationOpen}>
            <Stack spacing={2.5}>
            {displayMessages.map((message, index) => {
              const isAI = message.who === 'AI'
              const isUser = message.who === 'You' || message.who === 'USER'
              
              // 사용자 발화에만 피드백 표시
              const userIndex = Math.floor(index / 2) // 사용자 발화 인덱스 (0부터 시작)
              const utteranceFeedback = isUser ? {
                accuracy: 82 + (userIndex % 10),
                fluency: 75 + (userIndex % 12),
                prosody: 78 + (userIndex % 11),
                feedback: `이 발화는 전반적으로 명확했습니다. "${message.text.split(' ').slice(0, 4).join(' ')}" 부분의 강세와 리듬을 더 자연스럽게 하면 좋겠습니다.`
              } : null
              
              // 제안 문장 (사용자 발화에만)
                const suggestion = isUser ? generateSuggestion(message.text) : null
                const relatedAiMessage = isUser && index > 0 ? displayMessages[index - 1] : null
                const suggestionId = `${scenarioLabel}-${index}`
                const bookmarkPayload = isUser
                  ? {
                      ai: relatedAiMessage?.text || 'AI 질문',
                      you: message.text,
                      suggestion,
                      scenario: scenarioLabel
                    }
                  : null

              return (
                <Box key={index}>
                  {/* AI 질문 */}
                  {isAI && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '88%',
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(6px)'
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
                          AI
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#F5F6FF' }}>{message.text}</Typography>
                      </Box>
                    </Box>
                  )}

                  {/* 사용자 답변 + 피드백 + 제안 */}
                  {isUser && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 1
                      }}
                    >
                      {/* 사용자 발화 */}
                      <Box
                        sx={{
                          maxWidth: '88%',
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(124,108,255,0.25)',
                          border: '1px solid rgba(124,108,255,0.4)',
                          backdropFilter: 'blur(6px)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
                              You
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#F5F6FF' }}>{message.text}</Typography>
                          </Box>
                          {/* 오디오 재생 버튼 (Optional) */}
                          <IconButton size="small" sx={{ ml: 1, color: 'rgba(255,255,255,0.7)' }}>
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* 발화별 피드백 카드 */}
                      {utteranceFeedback && (
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            maxWidth: '88%',
                            bgcolor: 'rgba(255,255,255,0.03)',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(6px)'
                          }}
                        >
                          <CardContent sx={{ py: 1.5, px: 1.5 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip 
                                label={`정확도 ${utteranceFeedback.accuracy}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  color: '#F5F6FF'
                                }}
                              />
                              <Chip 
                                label={`유창성 ${utteranceFeedback.fluency}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  color: '#F5F6FF'
                                }}
                              />
                              <Chip 
                                label={`억양 ${utteranceFeedback.prosody}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  color: '#F5F6FF'
                                }}
                              />
                            </Stack>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#F5F6FF' }}>
                              {utteranceFeedback.feedback}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}

                      {/* 제안 문장 카드 */}
                      {suggestion && (
                        <Box
                          sx={{
                            maxWidth: '88%',
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            border: '1px dashed rgba(255,255,255,0.32)',
                            backdropFilter: 'blur(6px)'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
                                제안
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#F5F6FF', fontSize: '0.8125rem' }}>
                                {suggestion}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              aria-label="북마크"
                              onClick={() => toggleBookmark(suggestionId, bookmarkPayload)}
                              sx={{ 
                                color: bookmarked.has(suggestionId) ? 'primary.main' : 'rgba(255,255,255,0.5)',
                                mt: 0.5
                              }}
                            >
                              {bookmarked.has(suggestionId) ? (
                                <BookmarkIcon fontSize="small" />
                              ) : (
                                <BookmarkBorderIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )
            })}
            </Stack>
          </Collapse>
        </Box>

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* 🧠 전체 피드백 (LLM) */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
            전체 피드백
          </Typography>
          <Card 
            variant="outlined"
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(6px)'
            }}
          >
            <CardContent sx={{ py: 3, px: 2.5 }}>
              <Stack spacing={3}>
                {/* 종합 평가 */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                    종합 평가
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
                    {MOCK_FEEDBACK_DATA.overall.summary}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* 부족한 부분 */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                    부족한 부분
                  </Typography>
                  <Stack spacing={1}>
                    {MOCK_FEEDBACK_DATA.overall.weaknesses.map((weakness, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 1.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(255,193,7,0.1)',
                          border: '1px solid rgba(255,193,7,0.2)'
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 700 }}>•</Typography>
                        <Typography variant="body2" color="text.primary">{weakness}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* 개선 팁 */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                    개선 팁
                  </Typography>
                  <Stack spacing={1}>
                    {MOCK_FEEDBACK_DATA.overall.tips.map((tip, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 1.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'rgba(124,108,255,0.1)',
                          border: '1px solid rgba(124,108,255,0.2)'
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>•</Typography>
                        <Typography variant="body2" color="text.primary">{tip}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ mt: 2 }}
        >
          닫기
        </Button>
      </Stack>
    </Box>
  )
}
