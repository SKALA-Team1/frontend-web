import { useMemo } from 'react'

/**
 * 롤플레이 필터 관리를 위한 커스텀 훅
 * 
 * 탭에 따라 Slack 연동/미연동 시나리오를 구분하여 필터링
 * Slack 시나리오의 경우 같은 subjectId를 가진 시나리오들을 그룹화하여
 * Overview 1개와 Detail 1개(드롭다운으로 AI 역할 선택 가능)만 표시
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

    let filtered = []
    
    if (tab === 'linked') {
      // Slack으로 생성된 시나리오만 필터링
      filtered = scenarios.filter((item) => 
        item.creationType === 'SLACK' || item.creationType === 'slack'
      )
      
      // 같은 subjectId를 가진 시나리오들을 그룹화
      const groupedBySubject = {}
      filtered.forEach((scenario) => {
        const subjectId = scenario.subjectId
        if (!subjectId) {
          // subjectId가 없으면 그대로 추가 (기존 동작 유지)
          filtered.push(scenario)
          return
        }
        
        if (!groupedBySubject[subjectId]) {
          groupedBySubject[subjectId] = {
            overview: null,
            details: []
          }
        }
        
        const topicType = (scenario.topicType || '').toUpperCase()
        if (topicType === 'OVERVIEW') {
          groupedBySubject[subjectId].overview = scenario
        } else if (topicType === 'DETAIL') {
          groupedBySubject[subjectId].details.push(scenario)
        }
      })
      
      // 그룹화된 시나리오를 Overview 1개 + Detail 1개로 변환
      const result = []
      Object.keys(groupedBySubject).forEach((subjectId) => {
        const group = groupedBySubject[subjectId]
        
        // Overview 시나리오 추가
        if (group.overview) {
          result.push({
            ...group.overview,
            isGrouped: true,
            groupType: 'overview'
          })
        }
        
        // Detail 시나리오 1개 추가 (첫 번째 것을 기본으로, 나머지는 availableAiRoles에 포함)
        if (group.details.length > 0) {
          const firstDetail = group.details[0]
          const availableAiRoles = group.details.map(d => ({
            aiRole: d.aiRole,
            scenarioId: d.scenarioId
          }))
          
          result.push({
            ...firstDetail,
            isGrouped: true,
            groupType: 'detail',
            availableAiRoles, // 드롭다운에서 선택 가능한 AI 역할 목록
            selectedAiRoleIndex: 0 // 현재 선택된 AI 역할 인덱스
          })
        }
      })
      
      return result
    }

    // created 탭은 프롬프트로 생성된 시나리오만 표시 (기존 동작 유지)
    return scenarios.filter((item) => 
      item.creationType === 'PROMPT' || item.creationType === 'prompt'
    )
  }, [tab, scenarios])

  return {
    filteredItems
  }
}


