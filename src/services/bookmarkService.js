/**
 * 북마크 API 서비스
 *
 * 역할:
 * - 북마크 생성, 조회, 삭제 API 호출
 * - Spring 2 (CRUD 서버)의 /internal/bookmarks 엔드포인트와 통신
 *
 * API 엔드포인트:
 * - POST /internal/bookmarks - 북마크 생성
 * - GET /internal/bookmarks - 내 북마크 목록 조회
 * - DELETE /internal/bookmarks/{id} - 북마크 삭제
 */

import { request } from './httpClient'
import { API_ENDPOINTS } from '../config/constants'

const BASE_URL = `${API_ENDPOINTS.GATEWAY}/bookmarks`

/**
 * 내 북마크 목록 조회
 * @returns {Promise<Array>} 북마크 목록
 */
export async function getMyBookmarks() {
  return request(BASE_URL, {
    method: 'GET'
  })
}

/**
 * 북마크 생성
 * @param {number} messageId - 북마크할 메시지 ID
 * @returns {Promise<void>}
 */
export async function createBookmark(messageId) {
  return request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({ messageId })
  })
}

/**
 * 북마크 삭제
 * @param {number} bookmarkId - 삭제할 북마크 ID
 * @returns {Promise<void>}
 */
export async function deleteBookmark(bookmarkId) {
  return request(`${BASE_URL}/${bookmarkId}`, {
    method: 'DELETE'
  })
}
