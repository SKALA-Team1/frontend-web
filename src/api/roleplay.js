// API 연동을 위한 함수들을 여기에 작성합니다

// 환경 변수에서 API URL 가져오기 (Vite는 VITE_ 접두사 필요)
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'
const FASTAPI_WS_URL = import.meta.env.VITE_FASTAPI_WS_URL || 'ws://localhost:8082'

/**
 * JWT 토큰 생성 (테스트용)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<string>} JWT 토큰
 */
export async function getJwtToken(userId = 1) {
  const url = `${GATEWAY_URL}/auth/test/token/${userId}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] JWT 토큰 생성 실패:', response.status, errorText)
      throw new Error(`JWT 토큰 생성 실패 (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    return data.accessToken
  } catch (error) {
    console.error('[API] 네트워크 에러:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`백엔드 서버에 연결할 수 없습니다. URL: ${url}`)
    }
    throw error
  }
}

/**
 * 롤플레잉 세션 시작
 * @param {string} jwtToken - JWT 토큰
 * @param {number} scenarioId - 시나리오 ID
 * @returns {Promise<Object>} 세션 정보 (session_id, ws_url, scenario 등)
 */
export async function startSession(jwtToken, scenarioId) {
  const url = `${GATEWAY_URL}/roleplaying/sessions`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ scenarioId })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] 세션 생성 실패:', response.status, errorText)
      throw new Error(`세션 생성 실패 (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[API] 네트워크 에러:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`백엔드 서버에 연결할 수 없습니다. URL: ${url}`)
    }
    throw error
  }
}

/**
 * WebSocket 연결 생성
 * @param {string} wsUrl - WebSocket URL
 * @param {Function} onMessage - 메시지 수신 콜백
 * @param {Function} onError - 에러 콜백
 * @param {Function} onClose - 연결 종료 콜백
 * @param {Function} onOpen - 연결 완료 콜백 (선택사항)
 * @returns {WebSocket} WebSocket 인스턴스
 */
export function createWebSocketConnection(wsUrl, onMessage, onError, onClose, onOpen) {
  const ws = new WebSocket(wsUrl)
  
  // Binary 데이터 처리를 위해 arraybuffer로 설정
  ws.binaryType = 'arraybuffer'
  
  ws.onopen = () => {
    if (onOpen) {
      onOpen(ws)
    }
  }
  
  ws.onmessage = (event) => {
    try {
      // Binary 데이터인 경우 (Blob 또는 ArrayBuffer)
      if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
        // Binary 데이터는 오디오 청크이므로 처리하지 않음 (서버에서 보내는 것이 아님)
        // 클라이언트는 binary를 보내기만 하고, 서버는 JSON으로 응답함
        return
      }
      
      // JSON 메시지 파싱
      const message = JSON.parse(event.data)
      onMessage(message)
    } catch (error) {
      // 메시지 파싱 실패 무시
    }
  }
  
  ws.onerror = (error) => {
    onError(error)
  }
  
  ws.onclose = () => {
    onClose()
  }
  
  return ws
}

