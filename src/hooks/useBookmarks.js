import { useMemo, useCallback } from 'react'

/**
 * 북마크 관리를 위한 커스텀 훅
 * 
 * 역할:
 * - 북마크 UI를 위한 빈 인터페이스 제공
 * - 북마크 로직은 제거되었으며 UI만 유지
 * 
 * @returns {Object} 북마크 관련 상태 및 핸들러 (빈 값)
 *   - bookmarked: Set - 빈 Set (UI 호환성 유지)
 *   - toggleBookmark: Function - 빈 함수 (UI 호환성 유지)
 *   - bookmarkedSentences: Array - 빈 배열 (UI 호환성 유지)
 */
export default function useBookmarks() {
  // 빈 북마크 Set (UI 호환성 유지)
  const bookmarked = useMemo(() => new Set(), [])

  // 빈 토글 함수 (UI 호환성 유지)
  const toggleBookmark = useCallback(() => {
    // 북마크 로직 제거됨 - 아무 동작 안 함
  }, [])

  // 빈 북마크 문장 배열 (UI 호환성 유지)
  const bookmarkedSentences = useMemo(() => [], [])

  return {
    bookmarked,
    toggleBookmark,
    bookmarkedSentences
  }
}

