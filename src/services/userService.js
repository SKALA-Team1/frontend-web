/**
 * 사용자 정보 서비스
 * 
 * 역할:
 * - 사용자 정보 조회 및 관리
 * 
 * 주요 기능:
 * - 사용자 정보 조회: 현재 로그인한 사용자의 정보 조회
 * - JWT 기반 인증: JWT 토큰에서 userId 자동 추출
 * - 캐싱: 짧은 시간 동안 사용자 정보를 캐시하여 중복 호출 방지
 */

import * as httpClient from './httpClient'
import { API_ENDPOINTS } from '../config/constants'
import { getAccessToken } from './httpClient'

// 사용자 정보 캐시 (메모리 기반)
let userCache = null
let cacheTimestamp = null
let pendingRequest = null // 진행 중인 요청 Promise
const CACHE_DURATION = 5000 // 5초 동안 캐시 유지

/**
 * 현재 로그인한 사용자 정보 조회
 * @returns {Promise<Object>} 사용자 정보 (userId, email, name, jobRole 등)
 */
export async function getCurrentUser() {
  // Access Token이 변경되었으면 캐시 무효화
  const currentToken = getAccessToken()
  if (!currentToken) {
    userCache = null
    cacheTimestamp = null
    pendingRequest = null
  }

  // 캐시가 유효하면 캐시된 데이터 반환
  const now = Date.now()
  if (userCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return Promise.resolve(userCache)
  }

  // 이미 진행 중인 요청이 있으면 그 요청을 재사용 (동시 호출 방지)
  if (pendingRequest) {
    return pendingRequest
  }

  // Gateway의 /users/me 엔드포인트 호출
  // Gateway가 JWT에서 userId를 추출하여 Spring2로 요청
  const url = `${API_ENDPOINTS.GATEWAY}/users/me`
  pendingRequest = httpClient.get(url)
    .then((userInfo) => {
      // 캐시에 저장
      userCache = userInfo
      cacheTimestamp = Date.now()
      pendingRequest = null // 요청 완료
      return userInfo
    })
    .catch((error) => {
      pendingRequest = null // 에러 발생 시도 null로 설정
      throw error
    })
  
  return pendingRequest
}

/**
 * 사용자 정보 캐시 무효화 (로그아웃 시 호출)
 */
export function clearUserCache() {
  userCache = null
  cacheTimestamp = null
  pendingRequest = null
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

