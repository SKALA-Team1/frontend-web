import React from 'react'
import chapterTitles from '../../../data/learnChapters.json'

export default function useLearnPage() {
  const chapters = React.useMemo(() => chapterTitles, [])

  return {
    chapters
  }
}







