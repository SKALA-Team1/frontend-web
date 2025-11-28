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
 * 사용자 시나리오 목록 조회
 * @param {string} jwtToken - JWT 토큰
 * @returns {Promise<Array>} 시나리오 목록
 */
export async function fetchUserScenarios(jwtToken) {
  const url = `${GATEWAY_URL}/scenarios/my-scenarios`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] 시나리오 목록 조회 실패:', response.status, errorText)
      throw new Error(`시나리오 목록 조회 실패 (${response.status}): ${errorText}`)
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
 * 프롬프트 기반 시나리오 생성 요청 (Gateway)
 * @param {string} jwtToken - JWT 토큰
 * @param {{myRole:string, aiRole:string, situation:string}} payload
 * @returns {Promise<{userId:number, fastapi_url:string}>}
 */
export async function requestPromptScenario(jwtToken, payload) {
  const url = `${GATEWAY_URL}/scenarios/roleplaying/generate-from-prompt`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] 프롬프트 기반 시나리오 요청 실패:', response.status, errorText)
      throw new Error(`시나리오 생성 요청 실패 (${response.status}): ${errorText}`)
    }

    return response.json()
  } catch (error) {
    console.error('[API] 프롬프트 시나리오 요청 네트워크 에러:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Gateway에 연결할 수 없습니다. URL: ${url}`)
    }
    throw error
  }
}

/**
 * FastAPI에 직접 프롬프트 기반 시나리오 생성을 요청
 * @param {string} fastapiUrl - Gateway에서 전달받은 FastAPI URL
 * @param {string} jwtToken - JWT 토큰
 * @param {{userId:number, myRole:string, aiRole:string, situation:string}} payload
 * @returns {Promise<Object>} FastAPI에서 반환한 시나리오 정보
 */
export async function generateScenarioFromFastApi(fastapiUrl, jwtToken, payload) {
  // CORS 문제 해결: Vite 프록시를 통해 요청
  // FastAPI URL에서 경로만 추출하여 프록시 경로로 변환
  let url = fastapiUrl
  if (url.includes('localhost:8082') || url.includes('127.0.0.1:8082')) {
    // FastAPI 직접 URL을 프록시 경로로 변환
    const pathMatch = url.match(/https?:\/\/[^\/]+(\/.*)/)
    if (pathMatch) {
      url = `/api/fastapi${pathMatch[1]}`
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] FastAPI 시나리오 생성 실패:', response.status, errorText)
      throw new Error(`FastAPI 시나리오 생성 실패 (${response.status}): ${errorText}`)
    }

    return response.json()
  } catch (error) {
    console.error('[API] FastAPI 연결 에러:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`FastAPI 서버에 연결할 수 없습니다. URL: ${url}`)
    }
    throw error
  }
}

/**
 * Spring2에 시나리오 저장 요청
 * @param {string} jwtToken - JWT 토큰
 * @param {{userId:number, myRole:string, situation:string, scenario:{aiRole:string, topicType:string, title:string, fixedQuestions:Array}}} payload
 * @returns {Promise<Object>} 저장 결과
 */
export async function saveScenarioToSpring2(jwtToken, payload) {
  // CORS 문제 해결: Vite 프록시를 통해 요청
  const url = '/api/spring2/internal/scenarios/roleplaying/save-from-prompt'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Spring2 시나리오 저장 실패:', response.status, errorText)
      let errorMessage = `시나리오 저장 실패 (${response.status})`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.message) {
          errorMessage = errorJson.message
        } else if (errorJson.detail) {
          errorMessage = errorJson.detail
        }
      } catch {
        if (errorText) {
          errorMessage = `${errorMessage}: ${errorText}`
        }
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    console.error('[API] Spring2 연결 에러:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Spring2 서버에 연결할 수 없습니다.`)
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

