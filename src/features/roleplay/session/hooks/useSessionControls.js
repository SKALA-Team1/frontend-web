import { useState, useMemo } from 'react'
import useRoleplaySession from './useRoleplaySession'

/**
 * 롤플레이 세션 제어를 위한 커스텀 훅
 * 
 * 롤플레이 세션, 탭, 캘린더 등을 통합 관리
 * 
 * @param {Array} scenarios - 시나리오 목록
 * @param {Object} options - 옵션 객체
 * @param {Function} options.onSessionEnded - 세션이 자동으로 종료될 때 호출될 콜백 함수
 * 
 * @returns {Object} 롤플레이 세션 제어 관련 상태 및 핸들러
 *   - tab: string - 현재 탭 ('linked' | 'created')
 *   - setTab: Function - 탭 변경 핸들러
 *   - openCal: boolean - 캘린더 다이얼로그 열림 상태
 *   - setOpenCal: Function - 캘린더 다이얼로그 열림 상태 변경 핸들러
 *   - startDate: string - 필터 시작 날짜
 *   - setStartDate: Function - 시작 날짜 변경 핸들러
 *   - endDate: string - 필터 종료 날짜
 *   - setEndDate: Function - 종료 날짜 변경 핸들러
 *   - openEnd: boolean - 세션 종료 다이얼로그 열림 상태
 *   - setOpenEnd: Function - 세션 종료 다이얼로그 열림 상태 변경 핸들러
 *   - currentQuestion: string - 현재 AI 질문 텍스트
 *   - session: Object - 롤플레이 세션 훅 반환값
 *   - handleEndSession: Function - 세션 종료 핸들러
 */
export default function useSessionControls(scenarios = [], options = {}) {
  const { onSessionEnded } = options
  // 현재 탭 상태 ('linked': 연결된 시나리오, 'created': 생성한 시나리오)
  const [tab, setTab] = useState('linked')
  
  // 캘린더 다이얼로그 열림 상태
  const [openCal, setOpenCal] = useState(false)
  
  // 날짜 필터 시작 날짜
  const [startDate, setStartDate] = useState('')
  
  // 날짜 필터 종료 날짜
  const [endDate, setEndDate] = useState('')
  
  // 세션 종료 다이얼로그 열림 상태
  const [openEnd, setOpenEnd] = useState(false)

  // 롤플레이 세션 관리 훅
  const session = useRoleplaySession({
    onSessionEnded
  })

  /**
   * 현재 AI 질문 텍스트
   * 메시지 목록에서 가장 최근 AI 메시지를 찾거나, 선택된 본문이 있으면 그것을 반환
   * useMemo로 메모이제이션하여 불필요한 재계산 방지
   */
  const currentQuestion = useMemo(() => {
    // 메시지 목록에서 AI 메시지 찾기
    const q = session.messages.find((m) => m.who === 'AI')
    // AI 메시지가 있으면 그 텍스트, 없으면 선택된 본문, 둘 다 없으면 빈 문자열
    return q ? q.text : session.selectedBody || ''
  }, [session.messages, session.selectedBody])

  /**
   * 세션 종료 핸들러
   * 종료 다이얼로그를 닫고 실제 세션 종료 로직 실행
   */
  const handleEndSession = () => {
    setOpenEnd(false)
    session.endSession('user')
  }

  return {
    // State
    tab,
    setTab,
    openCal,
    setOpenCal,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    openEnd,
    setOpenEnd,
    currentQuestion,
    
    // Hooks
    session,
    
    // Handlers
    handleEndSession
  }
}
