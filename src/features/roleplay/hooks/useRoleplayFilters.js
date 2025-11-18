import { useState, useMemo } from 'react'
import linkedScenarios from '../../../data/roleplayLinked.json'
import createdScenarios from '../../../data/roleplayCreated.json'

export default function useRoleplayFilters(tab) {
  const [filter, setFilter] = useState('latest') // latest | done | pending

  const baseItems = tab === 'linked' ? linkedScenarios : createdScenarios

  const enrichedItems = useMemo(() => {
    const total = baseItems.length
    const days = [15, 14, 13, 12, 11]
    const groupSize = Math.max(1, Math.ceil(total / days.length))
    return baseItems.map((item, idx) => {
      const dayIdx = Math.min(Math.floor(idx / groupSize), days.length - 1)
      const day = String(days[dayIdx]).padStart(2, '0')
      return {
        ...item,
        date: `2025.11.${day}`,
        done: Boolean(item.completed),
        idx
      }
    })
  }, [baseItems])

  const filteredItems = useMemo(() => {
    if (filter === 'done') return enrichedItems.filter((item) => item.done)
    if (filter === 'pending') return enrichedItems.filter((item) => !item.done)
    return enrichedItems
  }, [enrichedItems, filter])

  return {
    filter,
    setFilter,
    filteredItems
  }
}


