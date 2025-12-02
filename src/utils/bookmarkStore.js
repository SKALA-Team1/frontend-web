/**
 * In-memory 북마크 저장소  *******************임시 북마크 기능**************************** 추후에 수정
 *
 * - 컴포넌트 간 북마크 상태 공유를 위해 사용
 * - 브라우저 새로고침 시 초기화되는 비영속(volatile) 저장 방식
 */
let bookmarkedSentences = []

/**
 * 북마크 변경을 전달받을 구독자 집합
 * - 각 구독자는 (bookmarks) => void 형태의 함수
 */
const listeners = new Set()

/**
 * 모든 구독자에게 최신 북마크 데이터를 전달
 * 예외 발생 시 개별 구독자에서만 경고하고 다른 구독자에게 영향 없음
 */
const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(bookmarkedSentences)
    } catch (error) {
      console.warn('[bookmarkStore] listener error', error)
    }
  })
}

/**
 * 현재 북마크 목록을 반환
 * @returns {Array} bookmarkedSentences
 */
export const getBookmarks = () => bookmarkedSentences

/**
 * 북마크 목록 업데이트
 *
 * @param {Array|Function} updater
 *   - 배열을 직접 전달하거나 (예: [])
 *   - 현재 배열을 인자로 받아 새 배열을 반환하는 함수 전달 가능
 *
 * 유효성 검사:
 *   - 결과가 배열이 아니면 경고 후 무시
 *   - 참조 동일(===)하면 변화 없음으로 간주하고 알림 건너뜀
 *
 * 구독자 알림:
 *   - 정상적으로 업데이트되면 notify() 호출
 */
export const updateBookmarks = (updater) => {
  const next = typeof updater === 'function' ? updater(bookmarkedSentences) : updater
  if (!Array.isArray(next)) {
    console.warn('[bookmarkStore] updater must return an array.')
    return
  }
  if (next === bookmarkedSentences) {
    return
  }
  bookmarkedSentences = next
  notify()
}

/**
 * 북마크 변경 구독
 *
 * @param {Function} listener - (bookmarks: Array) => void 형태의 콜백
 * @returns {Function} unsubscribe 함수
 */
export const subscribeBookmarks = (listener) => {
  if (typeof listener !== 'function') {
    return () => {}
  }
  listeners.add(listener)
  return () => listeners.delete(listener)
}