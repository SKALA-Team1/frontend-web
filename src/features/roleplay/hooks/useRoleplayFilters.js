import { useState, useMemo } from 'react'

/**
 * 롤플레이 필터 관리를 위한 커스텀 훅
 * 
 * 탭에 따라 다른 시나리오 목록을 로드하고, 필터 조건에 따라 항목을 필터링
 * 각 항목에 날짜 정보를 추가하여 표시
 * 
 * @param {string} tab - 현재 탭 ('linked' | 'created')
 * 
 * @returns {Object} 필터 관련 상태 및 필터링된 항목
 *   - filter: string - 현재 필터 상태 ('latest' | 'done' | 'pending')
 *   - setFilter: Function - 필터 상태 변경 핸들러
 *   - filteredItems: Array - 필터 조건에 맞는 시나리오 목록
 */
export default function useRoleplayFilters(tab, scenarios = []) {
  // 필터 상태 ('latest': 전체, 'done': 완료된 항목, 'pending': 미완료 항목)
  const [filter, setFilter] = useState('latest')

  const baseItems = useMemo(() => {
    if (!Array.isArray(scenarios)) return []

    if (tab === 'linked') {
      return scenarios
    }

    // created 탭은 상태가 GENERATED인 시나리오만 표시 (없으면 전체)
    const createdOnly = scenarios.filter((item) => item.status === 'GENERATED')
    return createdOnly.length > 0 ? createdOnly : scenarios
  }, [tab, scenarios])

  /**
   * 날짜 정보가 추가된 시나리오 목록
   * 각 시나리오에 날짜와 완료 상태 정보를 추가
   * useMemo로 메모이제이션하여 baseItems가 변경될 때만 재계산
   */
  const enrichedItems = useMemo(() => {
    return baseItems.map((item, idx) => ({
        ...item,
      idx,
      date: item.createdAtLabel || item.dateLabel || '날짜 정보 없음',
      done: item.status === 'FINISHED'
    }))
  }, [baseItems])

  /**
   * 필터 조건에 맞는 시나리오 목록
   * 필터 상태에 따라 완료된 항목만, 미완료 항목만, 또는 전체를 반환
   * useMemo로 메모이제이션하여 enrichedItems나 filter가 변경될 때만 재계산
   */
  const filteredItems = useMemo(() => {
    if (filter === 'done') return enrichedItems.filter((item) => item.done)
    if (filter === 'pending') return enrichedItems.filter((item) => !item.done)
    return enrichedItems // 'latest' 또는 기타: 전체 반환
  }, [enrichedItems, filter])

  return {
    filter,
    setFilter,
    filteredItems
  }
}


