/**
 * 사용자 정보 서비스
 * 
 * 역할:
 * - 사용자 정보 조회 및 관리
 * 
 * 주요 기능:
 * - 사용자 정보 조회: 현재 로그인한 사용자의 정보 조회
 * - JWT 기반 인증: JWT 토큰에서 userId 자동 추출
 */

import * as httpClient from './httpClient'
import { API_ENDPOINTS } from '../config/constants'
import { getUserIdFromToken } from '../utils/jwt'

/**
 * 현재 로그인한 사용자 정보 조회
 * @returns {Promise<Object>} 사용자 정보 (userId, email, name, jobRole 등)
 */
export async function getCurrentUser() {
  const userId = getUserIdFromToken()
  if (!userId) {
    throw new Error('로그인이 필요합니다.')
  }

  // Spring2의 /internal/users/{userId} 엔드포인트 호출
  // Vite proxy를 통해 /api/spring2로 요청하면 Spring2로 프록시됨
  const url = `/api/spring2/internal/users/${userId}`
  return httpClient.get(url)
}

