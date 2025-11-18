import { useState } from 'react'

export default function useBookmarks() {
  const [bookmarked, setBookmarked] = useState(new Set())

  const toggleBookmark = (id) => {
    setBookmarked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return {
    bookmarked,
    toggleBookmark
  }
}


