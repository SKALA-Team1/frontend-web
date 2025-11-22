import React from 'react'
import { dateForIndex } from '../../../utils/dateUtils.js'
import homeScenarios from '../../../data/homeScenarios.json'

export default function useHomePage() {
  const [openCreate, setOpenCreate] = React.useState(false)
  const [aiRole, setAiRole] = React.useState('')
  const [myRole, setMyRole] = React.useState('')
  const [goal, setGoal] = React.useState('')

  const contents = React.useMemo(() => {
    return homeScenarios
      .map((item, idx) => ({
        ...item,
        dateNum: 15 - (idx % 5),
        dateLabel: dateForIndex(idx)
      }))
      .sort((a, b) => b.dateNum - a.dateNum)
      .slice(0, 6)
  }, [])

  const handleOpenCreate = () => setOpenCreate(true)
  const handleCloseCreate = () => setOpenCreate(false)
  const handleAiRoleChange = (e) => setAiRole(e.target.value)
  const handleMyRoleChange = (e) => setMyRole(e.target.value)
  const handleGoalChange = (e) => setGoal(e.target.value)
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





