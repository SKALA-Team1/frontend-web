import React, { useState, useEffect } from 'react'
import { Box, Typography, Alert, Stack, Drawer, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import useItPractice from '../hooks/useItPractice'
import QuestionView from './QuestionView'
import AnswerInput from './AnswerInput'
import ResultView from './ResultView'
import ChatView from '../../it-chatbot/components/ChatView'

/**
 * IT 설명 연습 메인 뷰 (챗봇 통합)
 */
export default function PracticeView() {
  const {
    question,
    userAnswer,
    result,
    loading,
    error,
    step,
    setUserAnswer,
    fetchQuestion,
    submitAnswer,
    reset
  } = useItPractice()

  // 챗봇 토글 상태
  const [chatbotOpen, setChatbotOpen] = useState(false)

  // 컴포넌트 마운트 시 자동으로 질문 가져오기
  useEffect(() => {
    if (step === 'initial') {
      fetchQuestion()
    }
  }, [step, fetchQuestion])

  return (
    <Stack spacing={2} >
      {/* 헤더 카드 - 항상 표시 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(124,108,255,0.08) 0%, rgba(75,60,248,0.04) 100%)',
          border: '1px solid rgba(124,108,255,0.15)',
          borderRadius: 1.5,
          py: 2.5,
          px: { xs: 2.5, sm: 3.5 },
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(124,108,255,0.08)',
          mb: 1,
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124,108,255,0.15)',
            borderColor: 'rgba(124,108,255,0.2)'
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            lineHeight: 1.6,
            mb: 0.5
          }}
        >
          오늘의 IT 개념연습
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            lineHeight: 1.5
          }}
        >
          랜덤 IT 질문에 답변하고 AI 평가를 받아보세요
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* 답변 입력 화면 */}
      {step === 'answering' && (
        <Box sx={{ width: '100%' }}>
          <QuestionView question={question} />
          <AnswerInput
            value={userAnswer}
            onChange={setUserAnswer}
            onSubmit={submitAnswer}
            loading={loading}
            disabled={false}
            onChatbotToggle={() => setChatbotOpen(!chatbotOpen)}
          />

          {/* 챗봇 Drawer */}
          <Drawer
            anchor="right"
            open={chatbotOpen}
            onClose={() => setChatbotOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: '100%', sm: '400px', md: '500px' },
                maxWidth: '100vw',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                질문 도우미
              </Typography>
              <IconButton
                onClick={() => setChatbotOpen(false)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ChatView compact={false} currentQuestion={question} />
            </Box>
          </Drawer>
        </Box>
      )}

      {/* 결과 화면 */}
      {step === 'result' && (
        <Box sx={{ width: '100%' }}>
          <ResultView result={result} onTryAgain={reset} />
        </Box>
      )}
    </Stack>
  )
}
