import React, { useState } from 'react'
import { Box, Container, Tabs, Tab } from '@mui/material'
import PracticeView from '../it-practice/components/PracticeView'
import ChatView from '../it-chatbot/components/ChatView'

/**
 * 학습 메인 페이지
 * - IT 설명 연습
 * - IT 챗봇
 */
export default function LearnPage() {
  const [currentTab, setCurrentTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', pt: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="IT 설명 연습" />
            <Tab label="IT 챗봇" />
          </Tabs>
        </Box>

        {currentTab === 0 && <PracticeView />}
        {currentTab === 1 && <ChatView />}
      </Container>
    </Box>
  )
}
