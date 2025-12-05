import React from 'react'
import chapterTitles from '../../../data/learnChapters.json'

/**
 * 학습 페이지 관리를 위한 커스텀 훅
 * 
 * 역할:
 * - 학습 챕터 목록 제공
 * - 정적 데이터 메모이제이션
 * 
 * 주요 기능:
 * - 데이터 메모이제이션: JSON 데이터를 useMemo로 메모이제이션하여 불필요한 재계산 방지
 * - 정적 데이터 관리: learnChapters.json 파일에서 챕터 목록 로드
 * - 성능 최적화: 컴포넌트 리렌더링 시에도 동일한 데이터 참조 유지
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


