import { useState, useMemo } from 'react'
import useRoleplaySession from '../../roleplay/hooks/useRoleplaySession'
import useRoleplayFilters from '../../roleplay/hooks/useRoleplayFilters'
import useBookmarks from '../../roleplay/hooks/useBookmarks'

export default function useHomeRoleplay() {
  const [tab, setTab] = useState('linked')
  const [openCal, setOpenCal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [openPanel, setOpenPanel] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const session = useRoleplaySession()
  const filters = useRoleplayFilters(tab)
  const { bookmarked, toggleBookmark } = useBookmarks()

  const currentQuestion = useMemo(() => {
    const q = session.messages.find((m) => m.who === 'AI')
    return q ? q.text : session.selectedBody || ''
  }, [session.messages, session.selectedBody])

  const handleEndSession = () => {
    setOpenEnd(false)
    session.endSession()
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
    openPanel,
    setOpenPanel,
    openEnd,
    setOpenEnd,
    currentQuestion,
    
    // Hooks
    session,
    filters,
    bookmarked,
    toggleBookmark,
    
    // Handlers
    handleEndSession
  }
}

