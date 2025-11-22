import { useState, useMemo } from 'react'
import useRoleplaySession from '../../roleplay/hooks/useRoleplaySession'
import useRoleplayFilters from '../../roleplay/hooks/useRoleplayFilters'
import useBookmarks from '../../roleplay/hooks/useBookmarks'

export default function useFeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [tab, setTab] = useState('linked')
  const session = useRoleplaySession()
  const filters = useRoleplayFilters(tab)
  const { bookmarked, toggleBookmark } = useBookmarks()

  // 완료된 항목만 필터링
  const completedItems = useMemo(() => {
    return filters.filteredItems.filter((item) => item.done)
  }, [filters.filteredItems])

  const handleViewFeedback = (item) => {
    setSelectedFeedback(item)
    session.handleFeedbackView(item.title, item.body)
  }

  const handleCloseFeedback = () => {
    setSelectedFeedback(null)
    session.setView('list')
  }

  return {
    tab,
    setTab,
    completedItems,
    selectedFeedback,
    session,
    bookmarked,
    toggleBookmark,
    handleViewFeedback,
    handleCloseFeedback
  }
}

