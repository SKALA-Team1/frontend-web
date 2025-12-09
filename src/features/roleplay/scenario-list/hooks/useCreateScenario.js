import React from 'react'
import { requestPromptScenario, generateScenarioFromFastApi, saveScenarioToSpring2 } from '../../../../services/roleplayService'

/**
 * 시나리오 생성을 위한 커스텀 훅
 * 
 * 롤플레이 생성 다이얼로그 상태 및 시나리오 생성 로직을 관리
 * 
 * @returns {Object} 시나리오 생성 관련 상태 및 핸들러
 *   - openCreate: boolean - 롤플레이 생성 다이얼로그 열림 상태
 *   - aiRole: string - AI 역할 입력값
 *   - myRole: string - 내 역할 입력값
 *   - situation: string - 목적 상황 입력값
 *   - createLoading: boolean - 시나리오 생성 중 상태
 *   - createError: string | null - 시나리오 생성 에러 메시지
 *   - creationToast: string | null - 시나리오 생성 성공 토스트 메시지
 *   - clearCreationToast: Function - 토스트 메시지 제거 핸들러
 *   - handleOpenCreate: Function - 생성 다이얼로그 열기 핸들러
 *   - handleCloseCreate: Function - 생성 다이얼로그 닫기 핸들러
 *   - handleAiRoleChange: Function - AI 역할 변경 핸들러
 *   - handleMyRoleChange: Function - 내 역할 변경 핸들러
 *   - handleSituationChange: Function - 목적 상황 변경 핸들러
 *   - handleStartRoleplay: Function - 시나리오 생성 핸들러
 */
export default function useCreateScenario(scenarios = [], options = {}) {
  const { onScenarioCreated } = options
  // 롤플레이 생성 다이얼로그 열림 상태
  const [openCreate, setOpenCreate] = React.useState(false)
  
  // AI 역할 입력 상태
  const [aiRole, setAiRole] = React.useState('')
  
  // 내 역할 입력 상태
  const [myRole, setMyRole] = React.useState('')
  
  // 목적 상황 입력 상태
  const [situation, setSituation] = React.useState('')

  const [createLoading, setCreateLoading] = React.useState(false)
  const [createError, setCreateError] = React.useState(null)
  const [creationToast, setCreationToast] = React.useState(null)

  /**
   * 롤플레이 생성 다이얼로그 열기 핸들러
   */
  const handleOpenCreate = () => {
    setCreateError(null)
    setOpenCreate(true)
  }
  
  /**
   * 롤플레이 생성 다이얼로그 닫기 핸들러
   */
  const handleCloseCreate = () => setOpenCreate(false)
  
  /**
   * AI 역할 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleAiRoleChange = (e) => setAiRole(e.target.value)
  
  /**
   * 내 역할 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleMyRoleChange = (e) => setMyRole(e.target.value)
  
  /**
   * 목적 상황 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleSituationChange = (e) => setSituation(e.target.value)
  
  /**
   * 롤플레이 시작 핸들러
   * 사용자 입력으로 프롬프트 기반 시나리오를 생성하고 DB 저장
   */
  const handleStartRoleplay = React.useCallback(async () => {
    const trimmedAiRole = aiRole.trim()
    const trimmedMyRole = myRole.trim()
    const trimmedSituation = situation.trim()

    if (!trimmedAiRole || !trimmedMyRole || !trimmedSituation) {
      setCreateError('AI 역할, 나의 역할, 목적 상황을 모두 입력해주세요.')
      return
    }

    try {
      setCreateLoading(true)
      setCreateError(null)

      const promptResponse = await requestPromptScenario({
        aiRole: trimmedAiRole,
        myRole: trimmedMyRole,
        situation: trimmedSituation
      })

      if (!promptResponse?.fastapi_url || !promptResponse?.userId) {
        throw new Error('시나리오 생성 정보를 가져오지 못했습니다.')
      }

      // FastAPI에서 시나리오 1개 생성 (기본 시나리오)
      const scenarioResponse = await generateScenarioFromFastApi({
        fastapi_url: promptResponse.fastapi_url,
        userId: promptResponse.userId,
        aiRole: trimmedAiRole,
        myRole: trimmedMyRole,
        situation: trimmedSituation
      })

      if (!scenarioResponse?.scenario) {
        throw new Error('시나리오 생성에 실패했습니다.')
      }

      const baseScenario = scenarioResponse.scenario

      // Spring2에 시나리오 저장
      const savePayload = {
        userId: promptResponse.userId,
        myRole: trimmedMyRole,
        situation: trimmedSituation,
        scenario: {
          aiRole: baseScenario.aiRole || trimmedAiRole,
          topicType: baseScenario.topicType || 'direct',
          title: baseScenario.title || `${trimmedMyRole} - ${trimmedAiRole}`,
          fixedQuestions: baseScenario.fixedQuestions || []
        }
      }

      await saveScenarioToSpring2(savePayload)
      setCreationToast(`"${baseScenario.title || '시나리오'}" 시나리오를 생성하고 저장했어요.`)

      setAiRole('')
      setMyRole('')
      setSituation('')
      setOpenCreate(false)

      if (typeof onScenarioCreated === 'function') {
        onScenarioCreated()
      }
    } catch (error) {
      setCreateError(error.message || '시나리오 생성에 실패했습니다.')
    } finally {
      setCreateLoading(false)
    }
  }, [aiRole, myRole, situation, onScenarioCreated])

  React.useEffect(() => {
    if (!creationToast) return
    const timer = setTimeout(() => setCreationToast(null), 5000)
    return () => clearTimeout(timer)
  }, [creationToast])

  const clearCreationToast = React.useCallback(() => setCreationToast(null), [])

  return {
    openCreate,
    aiRole,
    myRole,
    situation,
    createLoading,
    createError,
    creationToast,
    clearCreationToast,
    handleOpenCreate,
    handleCloseCreate,
    handleAiRoleChange,
    handleMyRoleChange,
    handleSituationChange,
    handleStartRoleplay
  }
}


