import { useMemo } from 'react'

/**
 * 롤플레이 필터 관리를 위한 커스텀 훅
 * 
 * 탭에 따라 Slack 연동/미연동 시나리오를 구분하여 필터링
 * 
 * @param {string} tab - 현재 탭 ('linked' | 'created')
 * @param {Array} scenarios - 시나리오 목록
 * 
 * @returns {Object} 필터링된 항목
 *   - filteredItems: Array - 필터 조건에 맞는 시나리오 목록
 */
export default function useRoleplayFilters(tab, scenarios = []) {
  const filteredItems = useMemo(() => {
    if (!Array.isArray(scenarios)) return []

    if (tab === 'linked') {
      // Slack으로 생성된 시나리오만 표시
      return scenarios.filter((item) => 
        item.creationType === 'SLACK' || item.creationType === 'slack'
      )
    }

    // created 탭은 프롬프트로 생성된 시나리오만 표시
    return scenarios.filter((item) => 
      item.creationType === 'PROMPT' || item.creationType === 'prompt'
    )
  }, [tab, scenarios])

  return {
    filteredItems
  }
}


