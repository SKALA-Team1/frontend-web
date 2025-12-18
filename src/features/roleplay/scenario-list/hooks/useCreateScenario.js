import React from 'react'
import { requestPromptScenario } from '../../../../services/roleplayService'

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
 *   - createSuccess: boolean - 시나리오 생성 성공 상태
 *   - handleOpenCreate: Function - 생성 다이얼로그 열기 핸들러
 *   - handleCloseCreate: Function - 생성 다이얼로그 닫기 핸들러
 *   - handleAiRoleChange: Function - AI 역할 변경 핸들러
 *   - handleMyRoleChange: Function - 내 역할 변경 핸들러
 *   - handleSituationChange: Function - 목적 상황 변경 핸들러
 *   - handleStartRoleplay: Function - 시나리오 생성 핸들러
 */
export default function useCreateScenario(scenarios = [], options = {}) {
  const { onScenarioCreated, onStartRoleplay } = options
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
  const [createSuccess, setCreateSuccess] = React.useState(false)
  
  // 롤플레잉 시작 확인 다이얼로그 상태
  const [openStartConfirm, setOpenStartConfirm] = React.useState(false)
  const [createdScenario, setCreatedScenario] = React.useState(null)

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
   * 
   * 새로운 통합 API 사용:
   * POST /scenarios/roleplaying/generate-from-prompt
   * - Gateway가 Spring2를 호출하여 FastAPI 시나리오 생성 및 DB 저장을 한 번에 처리
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

      // 통합 API 호출: Gateway가 Spring2를 통해 FastAPI 호출 및 DB 저장을 한 번에 처리
      const response = await requestPromptScenario({
        aiRole: trimmedAiRole,
        myRole: trimmedMyRole,
        situation: trimmedSituation
      })

      // 응답 형식: { scenarioId, subjectId, success, message }
      if (!response?.success || !response?.scenarioId) {
        throw new Error(response?.message || '시나리오 생성에 실패했습니다.')
      }

      // 시나리오 생성 성공 - 모달창 내에서 성공 메시지 표시
      setCreateSuccess(true)
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        setCreateSuccess(false)
        setAiRole('')
        setMyRole('')
        setSituation('')
        setOpenCreate(false)
      }, 2000)

      if (typeof onScenarioCreated === 'function') {
        onScenarioCreated()
      }
    } catch (error) {
      setCreateError(error.message || '시나리오 생성에 실패했습니다.')
    } finally {
      setCreateLoading(false)
    }
  }, [aiRole, myRole, situation, onScenarioCreated])


  /**
   * 롤플레잉 시작 확인 다이얼로그에서 "예" 선택 핸들러
   */
  const handleConfirmStartRoleplay = React.useCallback(() => {
    if (!createdScenario || !onStartRoleplay) {
      setOpenStartConfirm(false)
      return
    }

    // 롤플레잉 시작
    onStartRoleplay(
      createdScenario.title,
      createdScenario.body,
      createdScenario.scenarioId
    )

    setOpenStartConfirm(false)
    setCreatedScenario(null)
  }, [createdScenario, onStartRoleplay])

  /**
   * 롤플레잉 시작 확인 다이얼로그에서 "아니오" 선택 핸들러
   */
  const handleCancelStartRoleplay = React.useCallback(() => {
    setOpenStartConfirm(false)
    setCreatedScenario(null)
  }, [])

  return {
    openCreate,
    aiRole,
    myRole,
    situation,
    createLoading,
    createError,
    createSuccess,
    handleOpenCreate,
    handleCloseCreate,
    handleAiRoleChange,
    handleMyRoleChange,
    handleSituationChange,
    handleStartRoleplay,
    // 롤플레잉 시작 확인 다이얼로그 관련
    openStartConfirm,
    createdScenario,
    handleConfirmStartRoleplay,
    handleCancelStartRoleplay
  }
}


