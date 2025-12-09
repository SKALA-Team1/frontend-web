/**
 * IT 설명 연습 서비스
 *
 * 역할:
 * - IT 개념 설명 연습 관련 API 호출
 * - 챗봇, 질문 조회, 평가 등
 *
 * 주요 기능:
 * - 랜덤 IT 질문 조회
 * - 사용자 답변 제출 및 평가
 * - IT 챗봇 대화
 *
 * 인증:
 * - 모든 API 호출은 httpClient를 통해 자동으로 accessToken이 Authorization 헤더에 추가됨
 */

import * as httpClient from './httpClient'
import { API_ENDPOINTS } from '../config/constants'

/**
 * 랜덤 IT 질문 조회
 * GET /it-explanation/questions/random
 * @returns {Promise<Object>} 질문 정보 (question_id, question_text, question_text_ko, category, difficulty, model_answer)
 */
export async function getRandomQuestion() {
  const url = `${API_ENDPOINTS.GATEWAY}/it-explanation/questions/random`
  return httpClient.get(url)
}

/**
 * IT 설명 연습 세션 생성 및 평가
 * POST /it-explanation/sessions
 * @param {Object} sessionData - 세션 데이터
 * @param {number} sessionData.question_id - 질문 ID
 * @param {string} sessionData.user_answer - 사용자 답변
 * @param {string} sessionData.session_type - 세션 타입 ("TEXT" or "VOICE")
 * @param {string} [sessionData.audio_url] - 음성 URL (선택)
 * @returns {Promise<Object>} 평가 결과 (session_id, scores, feedback, model_answer)
 */
export async function createPracticeSession(sessionData) {
  const url = `${API_ENDPOINTS.GATEWAY}/it-explanation/sessions`
  return httpClient.post(url, sessionData)
}

/**
 * IT 개념 설명 챗봇
 * POST /it-explanation/chatbot
 * @param {Object} chatData - 챗봇 데이터
 * @param {string} chatData.user_message - 사용자 메시지
 * @param {Array} [chatData.conversation_history] - 대화 히스토리 (선택)
 * @returns {Promise<Object>} 챗봇 응답 (bot_response, conversation_id)
 */
export async function chatWithBot(chatData) {
  const url = `${API_ENDPOINTS.GATEWAY}/it-explanation/chatbot`
  return httpClient.post(url, chatData)
}
