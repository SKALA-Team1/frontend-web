/**
 * HTTP 클라이언트 서비스
 * 
 * 역할:
 * - fetch API를 래핑하여 공통 로직 처리
 * - 에러 처리, 헤더 설정, 인터셉터 등을 중앙화
 * - DRY 원칙 준수
 * 
 * 주요 기능:
 * - 토큰 자동 추가: localStorage의 accessToken을 Authorization 헤더에 자동 추가
 * - 통합 에러 처리: 네트워크 에러, HTTP 에러를 통합적으로 처리하고 사용자 친화적 메시지 반환
 * - 응답 자동 파싱: JSON/텍스트 자동 감지 및 파싱 (Content-Type 기반)
 * - 204 No Content 처리: 빈 응답을 빈 객체로 반환
 * - HTTP 메서드 래퍼: GET, POST, DELETE 메서드를 간편하게 사용
 */

import { API_ENDPOINTS, HTTP_STATUS, STORAGE_KEYS } from '../config/constants'

// Access Token 메모리 저장 (페이지 새로고침 시 사라짐)
let accessTokenMemory = null

// 토큰 갱신 중복 방지를 위한 플래그
let isRefreshing = false
let refreshSubscribers = []

/**
 * Access Token을 메모리에 저장
 * @param {string} token - Access Token
 */
export function setAccessToken(token) {
  accessTokenMemory = token
  console.log('[httpClient] Access Token 메모리에 저장됨:', token ? `${token.substring(0, 20)}...` : 'null')
}

/**
 * 메모리에서 Access Token 조회
 * @returns {string | null}
 */
export function getAccessToken() {
  return accessTokenMemory
}

/**
 * 메모리에서 Access Token 제거
 */
export function clearAccessToken() {
  accessTokenMemory = null
}

// 개발용: 브라우저 콘솔에서 Access Token 확인 가능
// 콘솔에서 window.__getAccessToken() 호출
if (typeof window !== 'undefined') {
  window.__getAccessToken = () => {
    const token = getAccessToken()
    if (token) {
      console.log('Access Token:', token)
      return token
    } else {
      console.log('Access Token이 메모리에 없습니다.')
      return null
    }
  }
}

/**
 * 토큰 갱신 완료 후 대기 중인 요청들 재시도
 * @param {string} token - 새로운 Access Token
 */
function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

/**
 * 토큰 갱신 대기열에 추가
 * @param {Function} callback - 토큰 갱신 후 실행할 콜백
 */
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

/**
 * HTTP 요청 래퍼
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch options
 * @returns {Promise<any>} 응답 데이터
 */
export async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  // Authorization 헤더 자동 추가 (메모리에서 Access Token 읽기)
  const token = getAccessToken()
  if (token && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  } else if (!options.skipAuth) {
    console.warn('[httpClient] Access Token이 메모리에 없습니다. URL:', url)
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Refresh Token은 httpOnly 쿠키에서 자동 전송
    credentials: 'include',
  }

  try {
    const response = await fetch(url, config)

    // 응답이 성공적이지 않으면 에러 처리
    if (!response.ok) {
      // 401 에러이고, 인증이 필요한 요청이며, refresh 엔드포인트가 아닌 경우
      if (response.status === 401 && !options.skipAuth && !url.includes('/auth/refresh')) {
        return await handleUnauthorized(url, config)
      }
      await handleErrorResponse(response)
    }

    // 204 No Content의 경우 빈 객체 반환
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return {}
    }

    // JSON 파싱 시도
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    // Content-Type이 없거나 JSON이 아니면 텍스트로 받아서 JSON 파싱 시도
    const text = await response.text()
    try {
      // 텍스트가 JSON 형식이면 파싱
      return JSON.parse(text)
    } catch {
      // JSON이 아니면 텍스트 그대로 반환
      return text
    }
  } catch (error) {
    // 네트워크 에러 처리
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`서버에 연결할 수 없습니다. URL: ${url}`)
    }
    throw error
  }
}

/**
 * Refresh Token으로 Access Token 갱신
 * @returns {Promise<string>} 새로운 Access Token
 */
export async function refreshAccessToken() {
  // 이미 갱신 중이면 대기
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      addRefreshSubscriber((newToken) => {
        resolve(newToken)
      })
    })
  }

  // 토큰 갱신 시작
  isRefreshing = true

  try {
    // Refresh Token으로 새 Access Token 발급
    // Refresh Token은 httpOnly 쿠키에서 자동으로 전송됨
    const refreshUrl = `${API_ENDPOINTS.GATEWAY}/auth/refresh`
    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      // Content-Type 제거: body가 없으므로
      credentials: 'include',  // 쿠키 전송
      // body 없음: Refresh Token은 쿠키에서 읽음
    })

    if (!refreshResponse.ok) {
      // Refresh Token도 만료됨
      clearAccessToken()
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
    }

    const data = await refreshResponse.json()
    const newAccessToken = data.accessToken || data.access_token

    if (!newAccessToken) {
      throw new Error('Refresh 응답에 Access Token이 없습니다.')
    }

    // 새 Access Token을 메모리에 저장
    setAccessToken(newAccessToken)
    // Refresh Token은 백엔드에서 쿠키로 설정됨

    // 대기 중인 요청들에게 새 토큰 전달
    onRefreshed(newAccessToken)
    isRefreshing = false

    return newAccessToken
  } catch (error) {
    isRefreshing = false
    refreshSubscribers = []
    throw error
  }
}

/**
 * 401 Unauthorized 에러 처리 (토큰 자동 갱신)
 * @param {string} url - 원본 요청 URL
 * @param {Object} config - 원본 요청 설정
 * @returns {Promise<any>} 재시도된 요청의 응답
 */
async function handleUnauthorized(url, config) {
  // Refresh Token은 httpOnly 쿠키에 저장되어 있으므로
  // JavaScript로 접근 불가, 백엔드에서 자동으로 읽음

  // 토큰 갱신 중이면 대기
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      addRefreshSubscriber((newToken) => {
        // 새 Access Token을 메모리에 저장
        setAccessToken(newToken)
        // 새 토큰으로 헤더 업데이트
        config.headers['Authorization'] = `Bearer ${newToken}`
        // 원본 요청 재시도
        fetch(url, {
          ...config,
          credentials: 'include',  // 쿠키 전송
        })
          .then((response) => {
            if (!response.ok) {
              return handleErrorResponse(response)
            }
            if (response.status === HTTP_STATUS.NO_CONTENT) {
              return resolve({})
            }
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              return response.json().then(resolve)
            }
            return response.text().then(resolve)
          })
          .catch(reject)
      })
    })
  }

  // 토큰 갱신 시작
  isRefreshing = true

  try {
    // refreshAccessToken 함수 사용
    const newAccessToken = await refreshAccessToken()

    // 원본 요청 재시도
    config.headers['Authorization'] = `Bearer ${newAccessToken}`
    const retryResponse = await fetch(url, {
      ...config,
      credentials: 'include',  // 쿠키 전송
    })

    if (!retryResponse.ok) {
      await handleErrorResponse(retryResponse)
    }

    if (retryResponse.status === HTTP_STATUS.NO_CONTENT) {
      return {}
    }

    const contentType = retryResponse.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await retryResponse.json()
    }

    return await retryResponse.text()
  } catch (error) {
    isRefreshing = false
    refreshSubscribers = []
    // Refresh 실패 시 로그인 페이지로 리다이렉트 (httpClient 내부에서만)
    if (error.message.includes('인증이 만료되었습니다')) {
      clearAccessToken()
      window.location.href = '/login'
    }
    throw error
  }
}

/**
 * 에러 응답 처리
 * @param {Response} response - fetch Response 객체
 */
async function handleErrorResponse(response) {
  let errorMessage = `요청 실패 (${response.status})`

  try {
    const errorData = await response.json()
    errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage
  } catch {
    // JSON 파싱 실패 시 텍스트로 시도
    try {
      const errorText = await response.text()
      if (errorText) {
        errorMessage = `${errorMessage}: ${errorText}`
      }
    } catch {
      // 무시
    }
  }

  const error = new Error(errorMessage)
  // response 객체를 에러에 포함시켜서 상태 코드를 확인할 수 있도록 함
  error.response = response
  throw error
}

/**
 * GET 요청
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch options
 * @returns {Promise<any>}
 */
export function get(url, options = {}) {
  return request(url, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST 요청
 * @param {string} url - 요청 URL
 * @param {Object} data - 요청 바디
 * @param {Object} options - fetch options
 * @returns {Promise<any>}
 */
export function post(url, data, options = {}) {
  return request(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PATCH 요청
 * @param {string} url - 요청 URL
 * @param {Object} data - 요청 바디
 * @param {Object} options - fetch options
 * @returns {Promise<any>}
 */
export function patch(url, data, options = {}) {
  return request(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE 요청
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch options
 * @returns {Promise<any>}
 */
export function del(url, options = {}) {
  return request(url, {
    ...options,
    method: 'DELETE',
  })
}

