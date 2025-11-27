import { useState, useMemo } from 'react'
import linkedScenarios from '../../../data/roleplayLinked.json'
import createdScenarios from '../../../data/roleplayCreated.json'

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
export default function useRoleplayFilters(tab) {
  // 필터 상태 ('latest': 전체, 'done': 완료된 항목, 'pending': 미완료 항목)
  const [filter, setFilter] = useState('latest')

  // 탭에 따라 기본 시나리오 목록 선택
  // 'linked': 연결된 시나리오, 'created': 생성한 시나리오
  const baseItems = tab === 'linked' ? linkedScenarios : createdScenarios

  /**
   * 날짜 정보가 추가된 시나리오 목록
   * 각 시나리오에 날짜와 완료 상태 정보를 추가
   * useMemo로 메모이제이션하여 baseItems가 변경될 때만 재계산
   */
  const enrichedItems = useMemo(() => {
    const total = baseItems.length
    // 날짜 목록 (11월 15일부터 11일까지)
    const days = [15, 14, 13, 12, 11]
    // 각 날짜 그룹의 크기 계산 (총 항목 수를 날짜 수로 나눔)
    const groupSize = Math.max(1, Math.ceil(total / days.length))
    
    return baseItems.map((item, idx) => {
      // 현재 항목이 속한 날짜 그룹 인덱스 계산
      const dayIdx = Math.min(Math.floor(idx / groupSize), days.length - 1)
      // 날짜 문자열 생성 (예: "15" -> "15", "1" -> "01")
      const day = String(days[dayIdx]).padStart(2, '0')
      
      return {
        ...item,
        date: `2025.11.${day}`, // 날짜 문자열 (예: "2025.11.15")
        done: Boolean(item.completed), // 완료 상태 (completed 속성을 boolean으로 변환)
        idx // 원본 인덱스
      }
    })
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


