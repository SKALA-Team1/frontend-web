import React from 'react'
import chapterTitles from '../../../data/learnChapters.json'

/**
 * 학습 페이지 관리를 위한 커스텀 훅
 * 
 * 학습 챕터 목록을 제공
 * 
 * @returns {Object} 학습 페이지 데이터
 *   - chapters: Array - 학습 챕터 목록 (JSON 데이터)
 */
export default function useLearnPage() {
  /**
   * 학습 챕터 목록
   * JSON 데이터를 useMemo로 메모이제이션하여 불필요한 재계산 방지
   */
  const chapters = React.useMemo(() => chapterTitles, [])

  return {
    chapters
  }
}


