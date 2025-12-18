/**
 * 인증 서비스
 * 
 * 역할:
 * - 인증 관련 비즈니스 로직 처리
 * - API 호출 로직과 비즈니스 로직 분리 (Single Responsibility Principle)
 * 
 * 주요 기능:
 * - 토큰 자동 관리: 로그인/회원가입/갱신 시 토큰을 localStorage에 자동 저장
 * - snake_case/camelCase 호환: 백엔드 응답 형식(access_token/accessToken)에 관계없이 처리
 * - 인증 상태 확인: 간단한 함수로 인증 여부 확인 (isAuthenticated)
 * - 이메일 인증: 회원가입 시 이메일 인증 코드 발송 및 검증
 * - 토큰 갱신: 만료된 accessToken을 refreshToken으로 자동 갱신
 * - 로그아웃: 저장된 토큰 완전 제거
 */

import * as httpClient from './httpClient'
import { setAccessToken, clearAccessToken, getAccessToken } from './httpClient'
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants'

/**
 * 이메일 인증 코드 발송
 * @param {string} email - 이메일 주소
 * @returns {Promise<void>}
 */
export async function sendEmailVerificationCode(email) {
  const url = `${API_ENDPOINTS.GATEWAY}/auth/email/send-code`
  return httpClient.post(url, { email }, { skipAuth: true })
}

/**
 * 이메일 인증 코드 검증
 * @param {string} email - 이메일 주소
 * @param {string} code - 인증 코드 (6자리)
 * @returns {Promise<void>}
 */
export async function verifyEmailVerificationCode(email, code) {
  const url = `${API_ENDPOINTS.GATEWAY}/auth/email/verify-code`
  return httpClient.post(url, { email, code }, { skipAuth: true })
}

/**
 * 회원가입
 * @param {Object} userData - 사용자 정보
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export async function signup(userData) {
  const url = `${API_ENDPOINTS.GATEWAY}/auth/signup`
  const response = await httpClient.post(url, {
    email: userData.email,
    password: userData.password,
    name: userData.name,
    passwordConfirm: userData.passwordConfirm,
    agreeToTerms: userData.agreeToTerms,
    agreeToPrivacy: userData.agreeToPrivacy,
    job_role: userData.jobRole,
  }, { skipAuth: true })

  // 토큰 저장
  if (response.access_token || response.accessToken) {
    const accessToken = response.accessToken || response.access_token
    const refreshToken = response.refreshToken || response.refresh_token

    saveTokens(accessToken, refreshToken)
  }

  return response
}

/**
 * 로그인
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export async function login(email, password) {
  const url = `${API_ENDPOINTS.GATEWAY}/auth/login`
  const response = await httpClient.post(url, { email, password }, { skipAuth: true })

  // 토큰 저장
  if (response.access_token || response.accessToken) {
    const accessToken = response.accessToken || response.access_token
    const refreshToken = response.refreshToken || response.refresh_token

    console.log('[authService] 로그인 성공 - Access Token 저장:', accessToken ? '있음' : '없음')
    saveTokens(accessToken, refreshToken)
  } else {
    console.warn('[authService] 로그인 응답에 Access Token이 없습니다:', response)
  }

  return response
}

/**
 * 토큰 갱신
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export async function refreshToken(refreshToken) {
  const url = `${API_ENDPOINTS.GATEWAY}/auth/refresh`
  const response = await httpClient.post(url, { refresh_token: refreshToken }, { skipAuth: true })

  // 토큰 저장
  if (response.access_token || response.accessToken) {
    const accessToken = response.accessToken || response.access_token
    const newRefreshToken = response.refreshToken || response.refresh_token

    saveTokens(accessToken, newRefreshToken)
  }

  return response
}

/**
 * Google OAuth 로그인 URL 조회
 * @returns {Promise<string>} Google 로그인 URL
 */
export async function getGoogleLoginUrl() {
  const url = `${API_ENDPOINTS.GATEWAY}/auth/google/login`
  const response = await httpClient.get(url, { skipAuth: true })
  return response.login_url || response.loginUrl
}

/**
 * 로그아웃
 * 백엔드에 로그아웃 요청을 보내고, 성공/실패 여부와 관계없이 모든 토큰을 제거합니다.
 * 
 * 삭제되는 토큰:
 * - Access Token: 메모리에서 제거
 * - Refresh Token: 백엔드에서 httpOnly 쿠키 삭제
 * 
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    // 백엔드에 로그아웃 요청 (Refresh Token 쿠키 삭제 및 무효화)
    const url = `${API_ENDPOINTS.GATEWAY}/auth/logout`
    await httpClient.post(url, {}, { skipAuth: false }) // 인증 필요 (Access Token 헤더 + Refresh Token 쿠키)
    console.log('[authService] 로그아웃 성공 - 백엔드에서 Refresh Token 쿠키 삭제됨')
  } catch (error) {
    // 백엔드 요청 실패해도 메모리 토큰은 제거
    console.warn('[authService] 로그아웃 API 호출 실패, 하지만 로컬 토큰은 제거합니다:', error)
  } finally {
    // 메모리에서 Access Token 제거 (항상 실행)
    clearAccessToken()
    console.log('[authService] Access Token 메모리에서 제거 완료')
    // Refresh Token은 백엔드에서 httpOnly 쿠키로 삭제됨
  }
}

/**
 * 토큰 저장
 * @param {string} accessToken - Access Token (메모리에 저장)
 * @param {string} refreshToken - Refresh Token (백엔드에서 httpOnly 쿠키로 설정)
 */
function saveTokens(accessToken, refreshToken) {
  // Access Token은 메모리에 저장 (페이지 새로고침 시 사라짐)
  if (accessToken) {
    setAccessToken(accessToken)
  }
  // Refresh Token은 백엔드에서 httpOnly 쿠키로 설정되므로 프론트엔드에서 저장 불필요
}

/**
 * 현재 저장된 토큰 조회
 * @returns {{accessToken: string | null, refreshToken: string | null}}
 */
export function getStoredTokens() {
  return {
    accessToken: getAccessToken(),  // 메모리에서 읽기
    refreshToken: null,  // httpOnly 쿠키는 JavaScript로 접근 불가
  }
}

/**
 * 인증 상태 확인
 * @returns {boolean}
 */
export function isAuthenticated() {
  const accessToken = getAccessToken()
  return !!accessToken
}

