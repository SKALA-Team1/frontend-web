import React from 'react'
import { Tabs, Tab, IconButton, Box, Typography, Card, CardContent, Button, ToggleButtonGroup, ToggleButton, Chip, Stack } from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

export default function ScenarioList({
  tab,
  setTab,
  filteredItems,
  filter,
  setFilter,
  onOpenCalendar,
  onStartRoleplay
}) {
  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
        <Tab value="linked" label="Slack" />
        <Tab value="created" label="나의 롤플레잉" />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onOpenCalendar} aria-label="달력 열기">
          <CalendarMonthIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography variant="caption" color="text.primary">
          총 {filteredItems.length}개 시나리오
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          size="small"
          onChange={(_, value) => value && setFilter(value)}
        >
          <ToggleButton value="latest">최신순</ToggleButton>
          <ToggleButton value="done">완료</ToggleButton>
          <ToggleButton value="pending">미완료</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={2}>
        {filteredItems.map((item) => (
          <Card key={`${tab}-${item.idx}`} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.9375rem' }}>
                    {item.title}
                  </Typography>
                  {item.done && <Chip label="완료" size="small" />}
                </Box>
                <Typography variant="caption" color="text.primary">{item.date}</Typography>
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
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => onStartRoleplay(item.title, item.body, item.scenarioId || 1)}
                >
                  롤플레잉
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  )
}


