import React from 'react'
import { Box, Container, Typography, Button, Alert, Divider, Paper } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        IT 개념 설명 연습
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        랜덤 IT 질문에 답변하고 AI 평가를 받아보세요. 모르는 개념은 아래 챗봇에게 물어보세요!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* 시작 화면 */}
      {step === 'initial' && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            준비되셨나요?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchQuestion}
            disabled={loading}
            startIcon={<PlayArrowIcon />}
            size="large"
          >
            {loading ? '질문 가져오는 중...' : '시작하기'}
          </Button>
        </Box>
      )}

      {/* 답변 입력 화면 */}
      {step === 'answering' && (
        <Box>
          <QuestionView question={question} />
          <AnswerInput
            value={userAnswer}
            onChange={setUserAnswer}
            onSubmit={submitAnswer}
            loading={loading}
            disabled={false}
          />

          {/* 챗봇 섹션 (스크롤 아래) */}
          <Divider sx={{ my: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HelpOutlineIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                모르는 개념이 있나요? 아래 챗봇에게 물어보세요
              </Typography>
            </Box>
          </Divider>

          <Paper elevation={3} sx={{ p: 3, bgcolor: 'grey.50' }}>
            <ChatView compact />
          </Paper>
        </Box>
      )}

      {/* 결과 화면 */}
      {step === 'result' && (
        <Box>
          <ResultView result={result} onTryAgain={reset} />
        </Box>
      )}
    </Container>
  )
}
