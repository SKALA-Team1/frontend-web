import React from 'react'
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
  Collapse,
  Button
} from '@mui/material'
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
  const [isConversationOpen, setIsConversationOpen] = React.useState(true)
  const [isLongOpen, setIsLongOpen] = React.useState(false)

  const normalizedMessages = normalizeConversationMessages(messages)
  const displayMessages = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION

  const SHORT_FEEDBACK = '짧은 종합 피드백 더미: 이번 대화에서 핵심 의도를 잘 전달했고 흐름이 자연스러웠습니다.'
  const LONG_FEEDBACK =
    '긴 종합 피드백 더미: 이번 롤플레잉에서는 상황 이해와 맥락 유지가 전반적으로 우수했습니다. 다만 몇 차례 문법적 어색함이 있었고, 특정 질문에 답변이 길어졌습니다. 다음 연습에서는 핵심 메시지를 간결하게 전달하고, 일정한 발음과 억양을 유지해 보세요.'

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
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                짧은 버전
              </Typography>
              <Typography variant="body2" color="text.primary">
                {SHORT_FEEDBACK}
              </Typography>
            </Box>

            <Divider />

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
                <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                  {LONG_FEEDBACK}
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
