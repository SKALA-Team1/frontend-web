/**
 * 롤플레이 서비스
 * 
 * 역할:
 * - 롤플레이 및 시나리오 관련 비즈니스 로직 처리
 * 
 * 주요 기능:
 * - 시나리오 조회: 사용자의 시나리오 목록 조회
 * - 시나리오 생성: 프롬프트 기반 시나리오 생성 및 FastAPI/Spring2 연동
 * - 롤플레이 세션 관리: 세션 시작 및 WebSocket 연결 생성
 * 
 * 인증:
 * - 모든 API 호출은 httpClient를 통해 자동으로 accessToken이 Authorization 헤더에 추가됨
 * - 별도의 FastAPI용 JWT 토큰은 불필요 (기존 accessToken 사용)
 */

import * as httpClient from './httpClient'
import { API_ENDPOINTS } from '../config/constants'

/**
 * 사용자 시나리오 목록 조회
 * @returns {Promise<Array>}
 */
export async function fetchUserScenarios() {
  const url = `${API_ENDPOINTS.GATEWAY}/scenarios/my-scenarios`
  return httpClient.get(url)
}

/**
 * 프롬프트 기반 시나리오 요청
 * @param {Object} promptData - 프롬프트 데이터
 * @returns {Promise<Object>}
 */
export async function requestPromptScenario(promptData) {
  const url = `${API_ENDPOINTS.GATEWAY}/scenarios/prompt`
  return httpClient.post(url, promptData)
}

/**
 * FastAPI에서 시나리오 생성
 * @param {Object} scenarioData - 시나리오 데이터
 * @returns {Promise<Object>}
 */
export async function generateScenarioFromFastApi(scenarioData) {
  const url = `${API_ENDPOINTS.GATEWAY}/scenarios/generate`
  return httpClient.post(url, scenarioData)
}

/**
 * Spring2에 시나리오 저장
 * @param {Object} scenarioData - 시나리오 데이터
 * @returns {Promise<Object>}
 */
export async function saveScenarioToSpring2(scenarioData) {
  const url = `${API_ENDPOINTS.GATEWAY}/scenarios`
  return httpClient.post(url, scenarioData)
}

/**
 * 롤플레이 세션 시작
 * @param {number} scenarioId - 시나리오 ID
 * @returns {Promise<Object>} 세션 정보
 */
export async function startSession(scenarioId) {
  const url = `${API_ENDPOINTS.GATEWAY}/roleplaying/sessions`
  return httpClient.post(url, { scenarioId })
}

/**
 * WebSocket 연결 생성
 * @param {string} wsUrl - WebSocket URL
 * @param {Function} onMessage - 메시지 수신 핸들러
 * @param {Function} onError - 에러 핸들러
 * @param {Function} onClose - 연결 종료 핸들러
 * @param {Function} onOpen - 연결 완료 핸들러 (선택적)
 * @returns {WebSocket}
 */
export function createWebSocketConnection(wsUrl, onMessage, onError, onClose, onOpen) {
  const ws = new WebSocket(wsUrl)
  
  ws.onopen = (event) => {
    console.log('[roleplayService] WebSocket 연결 완료:', wsUrl)
    if (onOpen) {
      onOpen(ws)
    }
  }
  
  ws.onmessage = (event) => {
    if (onMessage) {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (error) {
        console.error('[roleplayService] Failed to parse WebSocket message:', error)
      }
    }
  }
  
  ws.onerror = (error) => {
    console.error('[roleplayService] WebSocket 에러:', error)
    if (onError) {
      onError(error)
    }
  }
  
  ws.onclose = (event) => {
    console.log('[roleplayService] WebSocket 연결 종료:', event.code, event.reason)
    if (onClose) {
      onClose(event)
    }
  }
  
  return ws
}

