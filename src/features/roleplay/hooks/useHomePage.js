import React from 'react'
import { dateForIndex } from '../../../utils/dateUtils.js'
import homeScenarios from '../../../data/homeScenarios.json'

/**
 * 홈 페이지 관리를 위한 커스텀 훅
 * 
 * 홈 화면의 시나리오 목록, 롤플레이 생성 다이얼로그 상태 등을 관리
 * 
 * @returns {Object} 홈 페이지 상태 및 핸들러
 *   - openCreate: boolean - 롤플레이 생성 다이얼로그 열림 상태
 *   - aiRole: string - AI 역할 입력값
 *   - myRole: string - 내 역할 입력값
 *   - goal: string - 목표 입력값
 *   - contents: Array - 홈 화면에 표시할 시나리오 목록 (최신 6개, 날짜 정보 포함)
 *   - handleOpenCreate: Function - 생성 다이얼로그 열기 핸들러
 *   - handleCloseCreate: Function - 생성 다이얼로그 닫기 핸들러
 *   - handleAiRoleChange: Function - AI 역할 변경 핸들러
 *   - handleMyRoleChange: Function - 내 역할 변경 핸들러
 *   - handleGoalChange: Function - 목표 변경 핸들러
 *   - handleStartRoleplay: Function - 롤플레이 시작 핸들러
 */
export default function useHomePage() {
  // 롤플레이 생성 다이얼로그 열림 상태
  const [openCreate, setOpenCreate] = React.useState(false)
  
  // AI 역할 입력 상태
  const [aiRole, setAiRole] = React.useState('')
  
  // 내 역할 입력 상태
  const [myRole, setMyRole] = React.useState('')
  
  // 목표 입력 상태
  const [goal, setGoal] = React.useState('')

  /**
   * 홈 화면에 표시할 시나리오 목록
   * JSON 데이터를 가공하여 날짜 정보를 추가하고, 최신순으로 정렬하여 최대 6개만 반환
   * useMemo로 메모이제이션하여 불필요한 재계산 방지
   */
  const contents = React.useMemo(() => {
    return homeScenarios
      // 각 시나리오에 날짜 정보 추가
      .map((item, idx) => ({
        ...item,
        dateNum: 15 - (idx % 5), // 날짜 번호 (15, 14, 13, 12, 11 순환)
        dateLabel: dateForIndex(idx) // 날짜 레이블 (예: "2025.11.15")
      }))
      // 날짜 번호 기준 내림차순 정렬 (최신순)
      .sort((a, b) => b.dateNum - a.dateNum)
      // 최대 6개만 반환
      .slice(0, 6)
  }, [])

  /**
   * 롤플레이 생성 다이얼로그 열기 핸들러
   */
  const handleOpenCreate = () => setOpenCreate(true)
  
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
   * 목표 입력 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleGoalChange = (e) => setGoal(e.target.value)
  
  /**
   * 롤플레이 시작 핸들러
   * 현재는 다이얼로그만 닫으며, 실제 롤플레이 시작 로직은 추후 백엔드 연동 예정
   */
  const handleStartRoleplay = () => {
    // 실제 롤플레이 시작 로직은 추후 연동
    setOpenCreate(false)
  }

  return {
    openCreate,
    aiRole,
    myRole,
    goal,
    contents,
    handleOpenCreate,
    handleCloseCreate,
    handleAiRoleChange,
    handleMyRoleChange,
    handleGoalChange,
    handleStartRoleplay
  }
}


