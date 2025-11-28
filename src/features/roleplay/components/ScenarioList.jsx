import React from 'react'
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

export default function ScenarioList({
  tab,
  setTab,
  filteredItems = [],
  onStartRoleplay,
  onViewFeedback,
  loading = false,
  error = null,
  onRetry,
  onOpenCalendar
}) {
  const handleStart = (item) => {
    const body = item.description || item.summary || `AI 역할 ${item.aiRole}과의 대화`
    onStartRoleplay(item.title, body, item.scenarioId || 1)
  }

  const scenarioCount = filteredItems.length

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
            <Card key={`${tab}-${item.idx ?? item.scenarioId}`} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.9375rem' }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.aiRole || 'AI 역할 미정'}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    {item.done && <Chip label="완료" size="small" />}
                  </Box>
                  <Typography variant="caption" color="text.primary">
                    {item.createdAtLabel || item.date || '날짜 정보 없음'}
                  </Typography>
                </Box>
                {item.fixedQuestions && item.fixedQuestions.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    고정 질문 {item.fixedQuestions.length}개
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button variant="contained" size="small" onClick={() => handleStart(item)}>
                    롤플레잉
                  </Button>
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


