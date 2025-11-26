import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBookmarks, updateBookmarks, subscribeBookmarks } from '../../../utils/bookmarkStore.js'

/**
 * 북마크 관리를 위한 커스텀 훅
 * 
 * 북마크한 문장의 추가/제거 및 상태 관리를 담당
 * bookmarkStore와 연동하여 전역 상태 관리
 * 
 * @returns {Object} 북마크 관련 상태 및 핸들러
 *   - bookmarked: Set - 북마크된 항목 ID Set (빠른 조회를 위해 Set 사용)
 *   - toggleBookmark: Function - 북마크 토글 핸들러 (추가/제거)
 *   - bookmarkedSentences: Array - 북마크된 문장 전체 데이터 배열
 */
export default function useBookmarks() {
  // 북마크된 문장 목록 상태
  // 초기값은 bookmarkStore에서 가져온 현재 북마크 목록
  const [bookmarkedSentences, setBookmarkedSentences] = useState(() => getBookmarks())

  /**
   * 북마크 변경 구독
   * bookmarkStore의 변경사항을 실시간으로 감지하여 북마크 목록 업데이트
   */
  useEffect(() => {
    // 북마크 변경 이벤트 구독
    const unsubscribe = subscribeBookmarks(setBookmarkedSentences)
    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe()
  }, [])

  /**
   * 북마크된 항목 ID Set
   * 빠른 조회를 위해 배열을 Set으로 변환
   * useMemo로 메모이제이션하여 bookmarkedSentences가 변경될 때만 재계산
   */
  const bookmarked = useMemo(() => {
    return new Set(bookmarkedSentences.map((item) => item.id))
  }, [bookmarkedSentences])

  /**
   * 북마크 토글 핸들러
   * 항목이 이미 북마크되어 있으면 제거, 없으면 추가
   * useCallback으로 메모이제이션하여 불필요한 재생성 방지
   * 
   * @param {string} id - 북마크할 항목의 고유 ID
   * @param {Object} payload - 북마크 추가 시 필요한 데이터 (ai, you, suggestion, scenario 등)
   */
  const toggleBookmark = useCallback((id, payload) => {
    updateBookmarks((current) => {
      // 현재 북마크 목록에서 해당 ID가 이미 존재하는지 확인
      const exists = current.some((item) => item.id === id)
      
      if (exists) {
        // 이미 북마크되어 있으면 제거
        return current.filter((item) => item.id !== id)
      }
      
      // 북마크 추가 시 payload가 없으면 경고하고 현재 상태 유지
      if (!payload) {
        console.warn('[useBookmarks] Bookmark payload is required when adding a new bookmark.')
        return current
      }
      
      // 새 북마크 추가 (ID와 함께 payload 데이터 포함)
      return [...current, { ...payload, id }]
    })
  }, [])

  return {
    bookmarked,
    toggleBookmark,
    bookmarkedSentences
  }
}


