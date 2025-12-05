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

  // Authorization 헤더 자동 추가
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token && !options.skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    // 응답이 성공적이지 않으면 에러 처리
    if (!response.ok) {
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

    // JSON이 아니면 텍스트로 반환
    return await response.text()
  } catch (error) {
    // 네트워크 에러 처리
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`서버에 연결할 수 없습니다. URL: ${url}`)
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

  throw new Error(errorMessage)
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

