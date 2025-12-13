import React from 'react'
import { 
  Stack, 
  Card, 
  CardContent, 
  Typography, 
  Box
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import useFeedbackPage from '../hooks/useFeedbackPage'

// 더미 피드백 데이터 6개
const MOCK_FEEDBACK_LIST = [
  {
    id: 1,
    scenarioTitle: 'Database Performance Optimization',
    executedDate: '2024-12-15',
    aiRole: 'Tech Lead',
    myRole: 'Backend Developer',
    sessionId: 'session-1'
  },
  {
    id: 2,
    scenarioTitle: 'API Endpoint Design Discussion',
    executedDate: '2024-12-14',
    aiRole: 'Senior Engineer',
    myRole: 'Full Stack Developer',
    sessionId: 'session-2'
  },
  {
    id: 3,
    scenarioTitle: 'Code Review and Refactoring',
    executedDate: '2024-12-13',
    aiRole: 'Engineering Manager',
    myRole: 'Junior Developer',
    sessionId: 'session-3'
  },
  {
    id: 4,
    scenarioTitle: 'System Architecture Planning',
    executedDate: '2024-12-12',
    aiRole: 'Architect',
    myRole: 'Software Engineer',
    sessionId: 'session-4'
  },
  {
    id: 5,
    scenarioTitle: 'Bug Fix and Deployment Strategy',
    executedDate: '2024-12-11',
    aiRole: 'QA Engineer',
    myRole: 'DevOps Engineer',
    sessionId: 'session-5'
  },
  {
    id: 6,
    scenarioTitle: 'Feature Implementation Discussion',
    executedDate: '2024-12-10',
    aiRole: 'Product Manager',
    myRole: 'Frontend Developer',
    sessionId: 'session-6'
  }
]

export default function FeedbackPage() {
  const {
    selectedFeedback,
    session,
    handleViewFeedback,
    handleCloseFeedback
  } = useFeedbackPage()
  
  // 피드백 상세 화면은 기존 로직 유지
  if (session.view === 'summary') {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          피드백 상세
            </Typography>
        {/* 기존 상세 화면 로직은 유지 */}
      </Box>
    )
  }

  // 피드백 목록 화면
    return (
        <Stack spacing={3}>
          {/* 헤더 */}
          <Stack spacing={0.5} alignItems="center" textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              피드백
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.75 }}>
          완료된 롤플레잉의 피드백을 확인하세요
            </Typography>
          </Stack>

      {/* 피드백 카드 리스트 */}
      <Stack spacing={2.5}>
        {MOCK_FEEDBACK_LIST.map((feedback) => (
              <Card 
            key={feedback.id}
            onClick={() => handleViewFeedback(feedback)}
                sx={{ 
              borderRadius: 3,
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
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
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
                  {feedback.scenarioTitle}
              </Typography>

                {/* 정보 섹션 */}
                <Stack spacing={1.5}>
                  {/* 나의 역할 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
                          <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        나의 역할
                            </Typography>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {feedback.myRole}
                              </Typography>
                      </Box>
          </Box>

                  {/* AI 역할 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
          <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        AI 역할
            </Typography>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {feedback.aiRole}
                    </Typography>
                  </Box>
                  </Box>

                  {/* 실행 날짜 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.6 }} />
                  <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        실행 날짜
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="text.secondary">
                        {feedback.executedDate}
                    </Typography>
                        </Box>
                  </Box>
                </Stack>
        </Stack>
              </CardContent>
            </Card>
        ))}
      </Stack>
    </Stack>
  )
}
