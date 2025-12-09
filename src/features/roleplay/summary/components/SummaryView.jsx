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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'



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
  scenarioTitle = '롤플레잉 시나리오'
}) {
  const [isConversationOpen, setIsConversationOpen] = React.useState(false)
  
  const normalizedMessages = normalizeConversationMessages(messages)
  const displayMessages = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION
  
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
                bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)',
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
                bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)',
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
                bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)',
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

        <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.1)' }} />

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
                bgcolor: 'rgba(0,0,0,0.03)'
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
                          bgcolor: 'rgba(0,0,0,0.08)',
                          border: '1px solid rgba(0,0,0,0.15)',
                          backdropFilter: 'blur(6px)'
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
                          AI
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#212121' }}>{message.text}</Typography>
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
                            <Typography variant="body2" sx={{ color: '#212121' }}>{message.text}</Typography>
                          </Box>
                          {/* 오디오 재생 버튼 (Optional) */}
                          <IconButton size="small" sx={{ ml: 1, color: 'rgba(0,0,0,0.6)' }}>
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
                            bgcolor: 'rgba(0,0,0,0.03)',
                            border: '1px dashed rgba(0,0,0,0.23)',
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
                                  borderColor: 'rgba(0,0,0,0.4)',
                                  color: '#212121'
                                }}
                              />
                              <Chip 
                                label={`유창성 ${utteranceFeedback.fluency}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  borderColor: 'rgba(0,0,0,0.4)',
                                  color: '#212121'
                                }}
                              />
                              <Chip 
                                label={`억양 ${utteranceFeedback.prosody}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 20,
                                  borderColor: 'rgba(0,0,0,0.4)',
                                  color: '#212121'
                                }}
                              />
                            </Stack>
                            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#212121' }}>
                              {utteranceFeedback.feedback}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}

                    </Box>
                  )}
                </Box>
              )
            })}
            </Stack>
          </Collapse>
        </Box>

        <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.1)' }} />

        {/* 🧠 전체 피드백 (LLM) */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
            전체 피드백
          </Typography>
          <Card 
            variant="outlined"
            sx={{
              bgcolor: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.1)',
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

                <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.1)' }} />

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

                <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.1)' }} />

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

                <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.1)' }} />
                
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
