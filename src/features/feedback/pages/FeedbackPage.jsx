import React from 'react'
import { Stack, Card, CardContent, Typography, Box, Chip, Button, Tabs, Tab } from '@mui/material'
import useFeedbackPage from '../hooks/useFeedbackPage'
import SummaryView from '../../roleplay/components/SummaryView'

export default function FeedbackPage() {
  const {
    tab,
    setTab,
    completedItems,
    selectedFeedback,
    session,
    bookmarked,
    toggleBookmark,
    handleViewFeedback,
    handleCloseFeedback
  } = useFeedbackPage()

  // 피드백 상세 화면
  if (session.view === 'summary') {
    return (
      <SummaryView
        summaryTab={session.summaryTab}
        setSummaryTab={session.setSummaryTab}
        messages={session.messages}
        bookmarked={bookmarked}
        toggleBookmark={toggleBookmark}
        onClose={handleCloseFeedback}
      />
    )
  }

  // 피드백 목록 화면
  return (

    <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        피드백
        </Typography>
        <Typography variant="body1" color="text.secendary" sx={{textAlign: 'center'}}>
            완료된 롤플레잉의 피드백을 확인하세요
        </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
        <Tab value="linked" label="Slack" />
        <Tab value="created" label="나의 롤플레잉" />
      </Tabs>

      <Stack spacing={2}>
        {completedItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              완료된 롤플레잉이 없습니다.
            </Typography>
          </Box>
        ) : (
          completedItems.map((item) => (
            <Card key={`${tab}-${item.idx}`} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.25rem' }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.primary">
                    {item.date}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.primary" 
                  sx={{ 
                    opacity: 0.85,
                    lineHeight: 1.6,
                    mb: 2
                  }}
                >
                  {item.body}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleViewFeedback(item)}
                  sx={{ width: '100%' }}
                >
                  피드백 보기
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  )
}

