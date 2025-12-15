import { useState, useEffect, useCallback } from 'react'
import { getMyBookmarks, createBookmark, deleteBookmark } from '../services/bookmarkService'

/**
 * 북마크 관리를 위한 커스텀 훅
 *
 * 역할:
 * - 북마크 목록 조회 (GET /internal/bookmarks)
 * - 북마크 생성 (POST /internal/bookmarks)
 * - 북마크 삭제 (DELETE /internal/bookmarks/{id})
 *
 * @returns {Object} 북마크 관련 상태 및 핸들러
 *   - bookmarks: Array - 북마크 목록
 *   - loading: boolean - 로딩 상태
 *   - error: string|null - 에러 메시지
 *   - refreshBookmarks: Function - 북마크 목록 새로고침
 *   - addBookmark: Function - 북마크 추가
 *   - removeBookmark: Function - 북마크 삭제
 */
export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 북마크 목록 조회
   */
  const refreshBookmarks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyBookmarks()
      // 응답이 배열인지 확인하고, 배열이 아니면 빈 배열로 설정
      // 만약 응답이 객체로 감싸져 있다면 (예: { bookmarks: [...] }), 적절히 추출
      let bookmarksArray = []
      if (Array.isArray(data)) {
        bookmarksArray = data
      } else if (data && Array.isArray(data.data)) {
        bookmarksArray = data.data
      } else if (data && Array.isArray(data.bookmarks)) {
        bookmarksArray = data.bookmarks
      }
      setBookmarks(bookmarksArray)
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
      setError(err.message || '북마크를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 북마크 추가
   * @param {number} messageId - 북마크할 메시지 ID
   */
  const addBookmark = useCallback(async (messageId) => {
    try {
      await createBookmark(messageId)
      // 성공 후 목록 새로고침
      await refreshBookmarks()
      return true
    } catch (err) {
      console.error('Failed to create bookmark:', err)
      setError(err.message || '북마크 추가에 실패했습니다.')
      return false
    }
  }, [refreshBookmarks])

  /**
   * 북마크 삭제
   * @param {number} bookmarkId - 삭제할 북마크 ID
   */
  const removeBookmark = useCallback(async (bookmarkId) => {
    try {
      await deleteBookmark(bookmarkId)
      // 성공 후 목록 새로고침
      await refreshBookmarks()
      return true
    } catch (err) {
      console.error('Failed to delete bookmark:', err)
      setError(err.message || '북마크 삭제에 실패했습니다.')
      return false
    }
  }, [refreshBookmarks])

  // 컴포넌트 마운트 시 북마크 목록 로드 (자동 로드 비활성화)
  // 필요 시 수동으로 refreshBookmarks() 호출
  // useEffect(() => {
  //   refreshBookmarks()
  // }, [refreshBookmarks])

  return {
    bookmarks,
    loading,
    error,
    refreshBookmarks,
    addBookmark,
    removeBookmark
  }
}
