import React, { memo, useCallback } from 'react'
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SlackIntegrationPrompt from './SlackIntegrationPrompt'

function ScenarioList({
  tab,
  setTab,
  filteredItems = [],
  isSlackIntegrated = false,
  userJobRole = null,
  onStartRoleplay,
  onViewFeedback,
  loading = false,
  error = null,
  onRetry,
  onOpenCalendar
}) {
  const handleStart = useCallback((item) => {
    const body = item.description || item.summary || `AI 역할 ${item.aiRole}과의 대화`
    onStartRoleplay(item.title, body, item.scenarioId || 1)
  }, [onStartRoleplay])

  const scenarioCount = filteredItems.length

  // Slack 미연동 시 연동 유도 화면 표시
  if (!isSlackIntegrated && tab === 'linked' && !loading && filteredItems.length === 0) {
    return (
      <>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab value="linked" label="Slack" />
          <Tab value="created" label="나의 롤플레잉" />
        </Tabs>
        <SlackIntegrationPrompt />
      </>
    )
  }

  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
        <Tab value="linked" label="Slack" />
        <Tab value="created" label="나의 롤플레잉" />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.primary">
          총 {scenarioCount}개 시나리오
        </Typography>
        {onOpenCalendar && (
          <IconButton onClick={onOpenCalendar} size="small" aria-label="달력 열기">
            <CalendarMonthIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                다시 시도
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredItems.map((item, idx) => (
            <Card 
              key={`${tab}-${item.idx ?? item.scenarioId}`} 
              variant="outlined"
              onClick={() => handleStart(item)}
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                {/* 제목 (전체 너비) */}
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={700} 
                    sx={{ 
                      fontSize: '0.9375rem',
                      width: '100%',
                      mb: 0.5
                    }}
                  >
                    {item.title}
                  </Typography>
                  {/* 날짜 (제목 아래 오른쪽) */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.createdAtLabel || item.date || '날짜 정보 없음'}
                    </Typography>
                  </Box>
                </Box>

                {/* 왼쪽 아래: 나의 역할과 AI 역할 */}
                <Box sx={{ mt: 2 }}>
                  {/* 나의 역할 */}
                  {userJobRole && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        나의 역할
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'primary.main',
                          fontWeight: 500
                        }}
                      >
                        {userJobRole}
                      </Typography>
                    </Box>
                  )}

                  {/* AI 역할 */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      AI 역할
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'primary.main',
                          fontWeight: 500
                        }}
                      >
                        {item.aiRole || 'AI 역할 미정'}
                      </Typography>
                      <KeyboardArrowDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          {!error && filteredItems.length === 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center">
                  표시할 시나리오가 없습니다.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </>
  )
}

export default memo(ScenarioList)

