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
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD 형식, 선택적)
 * @param {string} endDate - 끝 날짜 (YYYY-MM-DD 형식, 선택적)
 * 
 * @returns {Object} 필터링된 항목
 *   - filteredItems: Array - 필터 조건에 맞는 시나리오 목록
 */
export default function useRoleplayFilters(tab, scenarios = [], startDate = null, endDate = null) {
  const filteredItems = useMemo(() => {
    if (!Array.isArray(scenarios)) return []

    let filtered = []

    // 날짜 필터링 함수
    const matchesDateFilter = (scenario) => {
      // 날짜 필터가 없으면 모두 통과
      if (!startDate && !endDate) return true

      const createdAt = scenario.createdAt
      if (!createdAt) {
        // 날짜 정보가 없으면 필터가 설정된 경우 제외
        return !startDate && !endDate
      }

      const scenarioDate = new Date(createdAt)
      scenarioDate.setHours(0, 0, 0, 0) // 시간 부분 제거

      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (scenarioDate < start) return false
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // 하루의 끝까지 포함
        if (scenarioDate > end) return false
      }

      return true
    }

    if (tab === 'linked') {
      // Slack으로 생성된 시나리오만 필터링 + 날짜 필터 적용
      filtered = scenarios.filter((item) => 
        (item.creationType === 'SLACK' || item.creationType === 'slack') && matchesDateFilter(item)
      )
      
      // 같은 subjectId를 가진 시나리오들을 그룹화
      const groupedBySubject = {}
      const ungroupedScenarios = [] // subjectId가 없는 시나리오 저장
      
      filtered.forEach((scenario) => {
        const subjectId = scenario.subjectId
        if (!subjectId) {
          // subjectId가 없으면 별도 배열에 저장
          ungroupedScenarios.push(scenario)
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
      
      // 그룹화된 결과와 subjectId가 없는 시나리오를 병합하여 반환
      return [...result, ...ungroupedScenarios]
    }

    // created 탭은 프롬프트로 생성된 시나리오만 표시 + 날짜 필터 적용
    return scenarios.filter((item) => 
      (item.creationType === 'PROMPT' || item.creationType === 'prompt') && matchesDateFilter(item)
    )
  }, [tab, scenarios, startDate, endDate])

  return {
    filteredItems
  }
}


