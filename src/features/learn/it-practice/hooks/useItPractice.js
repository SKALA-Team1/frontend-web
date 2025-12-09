import { useState, useCallback } from 'react'
import { getRandomQuestion, createPracticeSession } from '../../../../services/itExplanationService'

/**
 * IT 설명 연습 로직을 관리하는 훅
 *
 * 흐름:
 * 1. 랜덤 질문 받기
 * 2. 사용자 답변 입력
 * 3. 평가 요청 및 결과 표시
 */
export default function useItPractice() {
  const [question, setQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('initial') // initial, answering, result

  /**
   * 랜덤 IT 질문 가져오기
   */
  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getRandomQuestion()
      setQuestion({
        questionId: data.question_id,
        questionText: data.question_text_ko || data.question_text,
        questionTextEn: data.question_text,
        category: data.category,
        difficulty: data.difficulty,
        modelAnswer: data.model_answer
      })
      setUserAnswer('')
      setResult(null)
      setStep('answering')
    } catch (err) {
      console.error('[useItPractice] 질문 로드 실패:', err)
      setError(err.message || '질문을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 답변 제출 및 평가 받기
   */
  const submitAnswer = useCallback(async () => {
    if (!question || !userAnswer.trim()) {
      setError('답변을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sessionData = {
        question_id: question.questionId,
        user_answer: userAnswer,
        session_type: 'TEXT'
      }

      const data = await createPracticeSession(sessionData)
      setResult({
        sessionId: data.session_id,
        scores: {
          clarity: data.scores.clarity_score,
          technicalAccuracy: data.scores.technical_accuracy_score,
          terminology: data.scores.terminology_score,
          overall: data.scores.overall_score
        },
        feedback: data.feedback,
        modelAnswer: data.model_answer
      })
      setStep('result')
    } catch (err) {
      console.error('[useItPractice] 평가 실패:', err)
      setError(err.message || '평가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [question, userAnswer])

  /**
   * 다시 시작
   */
  const reset = useCallback(() => {
    setQuestion(null)
    setUserAnswer('')
    setResult(null)
    setStep('initial')
    setError(null)
  }, [])

  return {
    // State
    question,
    userAnswer,
    result,
    loading,
    error,
    step,

    // Actions
    setUserAnswer,
    fetchQuestion,
    submitAnswer,
    reset
  }
}
