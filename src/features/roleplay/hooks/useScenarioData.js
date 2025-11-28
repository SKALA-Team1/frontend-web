import { useState, useEffect, useCallback } from 'react'
import { fetchUserScenarios, getJwtToken } from '../../../api/roleplay'

/**
 * 사용자 시나리오 데이터를 로드하는 훅
 * DB에 저장된 시나리오를 가져와 카드/리스트에서 재사용 가능한 형태로 변환한다.
 */
export default function useScenarioData() {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const normalizeScenario = useCallback((item) => {
    const createdAt = item.createdAt || item.created_at || null
    const createdDate = createdAt ? new Date(createdAt) : null
    const aiRole = item.aiRole || item.ai_role || 'AI 역할 미정'

    return {
      scenarioId: item.scenarioId ?? item.id ?? 0,
      title: item.title || '제목 미정',
      aiRole,
      status: item.status || 'IN_PROGRESS',
      createdAt: createdDate,
      createdAtLabel: createdDate
        ? createdDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : '날짜 정보 없음',
      fixedQuestions: item.fixedQuestions || item.fixed_questions || [],
      description: item.description || item.summary || `AI 역할 ${aiRole}와의 대화`,
    }
  }, [])

  const loadScenarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const jwtToken = await getJwtToken(1)
      const result = await fetchUserScenarios(jwtToken)

      const normalized = Array.isArray(result) ? result.map(normalizeScenario) : []
      setScenarios(normalized)
    } catch (err) {
      console.error('[useScenarioData] 시나리오 로드 실패:', err)
      setError(err.message || '시나리오 목록을 불러오지 못했습니다.')
      setScenarios([])
    } finally {
      setLoading(false)
    }
  }, [normalizeScenario])

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return {
    scenarios,
    loading,
    error,
    refresh: loadScenarios
  }
}

