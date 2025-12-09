import React from 'react'
import { Box, Container, Typography, Button, Alert } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import useItPractice from '../hooks/useItPractice'
import QuestionView from './QuestionView'
import AnswerInput from './AnswerInput'
import ResultView from './ResultView'

/**
 * IT 설명 연습 메인 뷰
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        IT 개념 설명 연습
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        랜덤 IT 질문에 답변하고 AI 평가를 받아보세요
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
