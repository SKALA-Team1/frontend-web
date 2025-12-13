import { useState, useEffect, useCallback } from 'react'
import { fetchUserScenarios } from '../../../../services/roleplayService'
import { getUserIdFromToken } from '../../../../utils/jwt'
import { checkSlackIntegration } from '../../../../services/integrationService'
import { getCurrentUser } from '../../../../services/userService'

/**
 * 사용자 시나리오 데이터를 로드하는 훅
 * DB에 저장된 시나리오를 가져와 카드/리스트에서 재사용 가능한 형태로 변환한다.
 */
export default function useScenarioData() {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSlackIntegrated, setIsSlackIntegrated] = useState(false)
  const [userJobRole, setUserJobRole] = useState(null)

  const normalizeScenario = useCallback((item) => {
    const createdAt = item.createdAt || item.created_at || null
    const createdDate = createdAt ? new Date(createdAt) : null
    const aiRole = item.aiRole || item.ai_role || 'AI 역할 미정'
    const myRole = item.myRole || item.my_role || null

    return {
      scenarioId: item.scenarioId ?? item.id ?? 0,
      subjectId: item.subjectId ?? item.subject_id ?? null,
      title: item.title || '제목 미정',
      aiRole,
      myRole,  // 나의 역할 (SLACK=user.jobRole, PROMPT=subject.myRole)
      topicType: item.topicType || item.topic_type || null,
      status: item.status || 'IN_PROGRESS',
      creationType: item.creationType || item.creation_type || 'UNKNOWN',
      createdAt: createdDate,
      createdAtLabel: createdDate
        ? createdDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : '날짜 정보 없음',
      fixedQuestions: item.fixedQuestions || item.fixed_questions || [],
      description: item.description || item.summary || `AI 역할 ${aiRole}와의 대화`,
    }
  }, [])

  const loadScenarios = useCallback(async (options = {}) => {
    const { silent = false } = options
    try {
      if (!silent) {
        setLoading(true)
      }
      setError(null)

      // 1. JWT에서 userId 추출
      const userId = getUserIdFromToken()
      if (!userId) {
        throw new Error('로그인이 필요합니다.')
      }

      // 1-1. 사용자 정보 조회 (jobRole 가져오기)
      try {
        const userInfo = await getCurrentUser()
        setUserJobRole(userInfo.job_role || userInfo.jobRole || null)
      } catch (userError) {
        console.warn('[useScenarioData] 사용자 정보 조회 실패:', userError)
        setUserJobRole(null)
      }

      // 2. 시나리오 먼저 로드 시도 (시나리오가 있으면 Slack 연동 여부와 관계없이 표시)
      let scenariosLoaded = []
      try {
        const result = await fetchUserScenarios()
        console.log('[DEBUG] API 응답 원본:', result)
        if (Array.isArray(result) && result.length > 0) {
          console.log('[DEBUG] 첫 번째 시나리오:', result[0])
          console.log('[DEBUG] creationType:', result[0].creationType)
        }
        scenariosLoaded = Array.isArray(result) ? result.map(normalizeScenario) : []
        console.log('[DEBUG] 정규화된 시나리오:', scenariosLoaded)
        setScenarios(scenariosLoaded)
      } catch (scenarioError) {
        console.warn('[useScenarioData] 시나리오 로드 실패:', scenarioError)
        setScenarios([])
      }

      // 3. Slack 연동 상태 확인
      // SLACK 타입 시나리오가 있으면 연동된 것으로 판단
      const hasSlackScenarios = scenariosLoaded.some(s => s.creationType === 'SLACK')

      let integrated = false
      try {
        integrated = await checkSlackIntegration()
      } catch (integrationError) {
        console.warn('[useScenarioData] Slack 연동 상태 확인 중 에러:', integrationError)
        // API 실패 시 SLACK 시나리오 존재 여부로 판단
        integrated = hasSlackScenarios
      }

      // integration 테이블 확인 결과 또는 SLACK 시나리오 존재 여부로 연동 상태 결정
      setIsSlackIntegrated(integrated || hasSlackScenarios)
    } catch (err) {
      // 로그인 관련 에러만 표시
      if (err.message && err.message.includes('로그인')) {
        console.error('[useScenarioData] 로그인 필요:', err)
        setError(err.message)
      } else {
        // 기타 에러는 조용히 처리 (에러 메시지 표시 안 함)
        console.warn('[useScenarioData] 시나리오 로드 중 에러 (무시):', err)
      }
      setScenarios([])
      setIsSlackIntegrated(false)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [normalizeScenario])

  useEffect(() => {
    loadScenarios()
  }, [loadScenarios])

  return {
    scenarios,
    loading,
    error,
    isSlackIntegrated,
    userJobRole,
    refresh: loadScenarios
  }
}
