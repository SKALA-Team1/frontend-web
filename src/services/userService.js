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

/**
 * 현재 로그인한 사용자 정보 조회
 * @returns {Promise<Object>} 사용자 정보 (userId, email, name, jobRole 등)
 */
export async function getCurrentUser() {
  // Gateway의 /users/me 엔드포인트 호출
  // Gateway가 JWT에서 userId를 추출하여 Spring2로 요청
  const url = `${API_ENDPOINTS.GATEWAY}/users/me`
  return httpClient.get(url)
}

/**
 * 사용자의 job_role 업데이트
 * @param {string} jobRole - 직무 (예: "개발자", "디자이너")
 * @returns {Promise<Object>} 업데이트된 사용자 정보
 */
export async function updateJobRole(jobRole) {
  const url = `${API_ENDPOINTS.GATEWAY}/users/me/profile`
  return httpClient.patch(url, { job_role: jobRole })
}

