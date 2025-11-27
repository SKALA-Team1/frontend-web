import { useState, useMemo } from 'react'
import useRoleplaySession from '../../roleplay/hooks/useRoleplaySession'
import useRoleplayFilters from '../../roleplay/hooks/useRoleplayFilters'
import useBookmarks from '../../../hooks/useBookmarks'

/**
 * 피드백 페이지 관리를 위한 커스텀 훅
 * 
 * 피드백 화면의 시나리오 목록, 선택된 피드백, 완료된 항목 필터링 등을 관리
 * 
 * @returns {Object} 피드백 페이지 상태 및 핸들러
 *   - tab: string - 현재 탭 ('linked' | 'created')
 *   - setTab: Function - 탭 변경 핸들러
 *   - completedItems: Array - 완료된 시나리오 목록만 필터링된 배열
 *   - selectedFeedback: Object | null - 선택된 피드백 항목
 *   - session: Object - 롤플레이 세션 훅 반환값
 *   - bookmarked: Set - 북마크된 항목 ID Set
 *   - toggleBookmark: Function - 북마크 토글 핸들러
 *   - handleViewFeedback: Function - 피드백 보기 핸들러
 *   - handleCloseFeedback: Function - 피드백 닫기 핸들러
 */
export default function useFeedbackPage() {
  // 선택된 피드백 항목 상태
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  
  // 현재 탭 상태 ('linked': 연결된 시나리오, 'created': 생성한 시나리오)
  const [tab, setTab] = useState('linked')
  
  // 롤플레이 세션 관리 훅
  const session = useRoleplaySession()
  
  // 롤플레이 필터 관리 훅 (현재 탭에 따라 필터링)
  const filters = useRoleplayFilters(tab)
  
  // 북마크 관리 훅
  const { bookmarked, toggleBookmark } = useBookmarks()

  /**
   * 완료된 항목만 필터링
   * 필터링된 항목 중에서 done 속성이 true인 항목만 반환
   * useMemo로 메모이제이션하여 필터링 결과가 변경될 때만 재계산
   */
  const completedItems = useMemo(() => {
    return filters.filteredItems.filter((item) => item.done)
  }, [filters.filteredItems])

  /**
   * 피드백 보기 핸들러
   * 선택된 항목을 저장하고 세션의 피드백 뷰로 전환
   * @param {Object} item - 선택된 피드백 항목 (title, body 포함)
   */
  const handleViewFeedback = (item) => {
    setSelectedFeedback(item)
    session.handleFeedbackView(item.title, item.body)
  }

  /**
   * 피드백 닫기 핸들러
   * 선택된 피드백을 초기화하고 세션 뷰를 리스트로 전환
   */
  const handleCloseFeedback = () => {
    setSelectedFeedback(null)
    session.setView('list')
  }

  return {
    tab,
    setTab,
    completedItems,
    selectedFeedback,
    session,
    bookmarked,
    toggleBookmark,
    handleViewFeedback,
    handleCloseFeedback
  }
}



