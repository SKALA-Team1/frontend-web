// API 연동을 위한 함수들을 여기에 작성합니다
// 예시:

/**
 * 시나리오 목록 조회
 * @param {string} type - 'linked' | 'created'
 * @returns {Promise<Array>}
 */
export async function getScenarios(type) {
  // TODO: API 호출 구현
  // const response = await fetch(`/api/roleplay/scenarios?type=${type}`)
  // return response.json()
  return []
}

/**
 * 롤플레잉 세션 시작
 * @param {string} scenarioId
 * @returns {Promise<Object>}
 */
export async function startSession(scenarioId) {
  // TODO: API 호출 구현
  // const response = await fetch('/api/roleplay/session/start', {
  //   method: 'POST',
  //   body: JSON.stringify({ scenarioId })
  // })
  // return response.json()
  return {}
}

/**
 * 롤플레잉 세션 종료 및 평가 요청
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function endSession(sessionId) {
  // TODO: API 호출 구현
  // const response = await fetch(`/api/roleplay/session/${sessionId}/end`, {
  //   method: 'POST'
  // })
  // return response.json()
  return {}
}

/**
 * 피드백 내역 조회
 * @param {string} scenarioId
 * @returns {Promise<Array>}
 */
export async function getFeedbackHistory(scenarioId) {
  // TODO: API 호출 구현
  // const response = await fetch(`/api/roleplay/feedback?scenarioId=${scenarioId}`)
  // return response.json()
  return []
}

/**
 * 북마크 추가/제거
 * @param {string} suggestionId
 * @param {boolean} isBookmarked
 * @returns {Promise<Object>}
 */
export async function toggleBookmark(suggestionId, isBookmarked) {
  // TODO: API 호출 구현
  // const response = await fetch(`/api/roleplay/bookmark`, {
  //   method: isBookmarked ? 'DELETE' : 'POST',
  //   body: JSON.stringify({ suggestionId })
  // })
  // return response.json()
  return {}
}

