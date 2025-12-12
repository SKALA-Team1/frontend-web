/**
 * 통합(Integration) 서비스
 * 
 * 역할:
 * - Slack 연동 관련 비즈니스 로직 처리
 * 
 * 주요 기능:
 * - Slack 연동 상태 확인: DB에서 사용자의 Slack 연동 여부 확인
 * - 자동 토큰 갱신: 401 에러 발생 시 자동으로 토큰 갱신 후 재시도
 * - 에러 처리: 404/500 에러는 미연동으로 처리하여 앱 크래시 방지
 * - OAuth URL 생성: Slack OAuth 인증 URL 동적 생성 (client_id, scope, redirect_uri 포함)
 * - JWT 기반 인증: JWT 토큰에서 userId 자동 추출
 */

import * as httpClient from './httpClient'
import { API_ENDPOINTS, SLACK_CONFIG } from '../config/constants'
import { getUserIdFromToken } from '../utils/jwt'
import { refreshToken, getStoredTokens } from './authService'

/**
 * Slack 연동 상태 확인
 * @returns {Promise<boolean>}
 */
export async function checkSlackIntegration() {
  const userId = getUserIdFromToken()
  if (!userId) {
    console.warn('[Integration Service] userId를 찾을 수 없습니다.')
    return false
  }

  const url = `${API_ENDPOINTS.GATEWAY}/integrations/slack/status?userId=${userId}`

  try {
    const data = await httpClient.get(url)
    return data.isIntegrated === true
  } catch (error) {
    // 401 Unauthorized - 토큰 갱신 시도
    if (error.message.includes('401')) {
      const { refreshToken: storedRefreshToken } = getStoredTokens()
      if (!storedRefreshToken) {
        throw new Error('로그인이 필요합니다.')
      }

      try {
        await refreshToken(storedRefreshToken)
        // 토큰 갱신 후 재시도
        const data = await httpClient.get(url)
        return data.isIntegrated === true
      } catch (refreshError) {
        console.error('[Integration Service] 토큰 갱신 실패:', refreshError)
        throw new Error('로그인이 필요합니다.')
      }
    }

    // 500 또는 404 에러는 미연동으로 처리
    if (error.message.includes('500') || error.message.includes('404')) {
      console.warn('[Integration Service] Slack 연동 상태 확인 실패 (엔드포인트 없음 또는 서버 에러), 미연동으로 처리')
      return false
    }

    console.warn('[Integration Service] Slack 연동 상태 확인 실패, 미연동으로 처리:', error)
    return false
  }
}

/**
 * Slack OAuth URL 생성 (클라이언트 사이드)
 * @param {number} userId - 사용자 ID
 * @returns {string} Slack OAuth URL
 */
export function getSlackLoginUrl(userId) {
  const redirectUri = `${SLACK_CONFIG.NGROK_URL}/internal/integrations/slack/callback`
  const params = new URLSearchParams({
    client_id: SLACK_CONFIG.CLIENT_ID,
    scope: SLACK_CONFIG.SCOPES,
    redirect_uri: redirectUri,
    state: userId.toString(),
  })

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}

/**
 * Slack OAuth URL 조회 (Gateway를 통해 서버에서 생성)
 * @returns {Promise<string>} Slack OAuth URL
 */
export async function getSlackAuthUrl() {
  const url = `${API_ENDPOINTS.GATEWAY}/integrations/slack/login`

  try {
    const data = await httpClient.get(url)
    return data.authUrl
  } catch (error) {
    console.error('[Integration Service] Slack OAuth URL 조회 실패:', error)
    throw new Error('Slack 인증 URL을 가져올 수 없습니다.')
  }
}

/**
 * Slack 채널 목록 조회
 * @returns {Promise<Array>} 채널 목록 [{ id, name, isMember }]
 */
export async function getSlackChannels() {
  const url = `${API_ENDPOINTS.GATEWAY}/integrations/slack/channels`

  try {
    const data = await httpClient.get(url)
    return data
  } catch (error) {
    console.error('[Integration Service] Slack 채널 목록 조회 실패:', error)
    throw new Error('Slack 채널 목록을 가져올 수 없습니다.')
  }
}

/**
 * Slack 채널 선택
 * @param {string} channelId - 선택한 채널 ID
 * @returns {Promise<string>} 성공 메시지
 */
export async function selectSlackChannel(channelId) {
  const url = `${API_ENDPOINTS.GATEWAY}/integrations/slack/channels/${channelId}/select`

  try {
    const data = await httpClient.post(url)
    return data
  } catch (error) {
    console.error('[Integration Service] Slack 채널 선택 실패:', error)
    throw new Error('Slack 채널 선택에 실패했습니다.')
  }
}

