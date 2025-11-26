# 프론트엔드 백엔드 통신 가이드

## 개요

이 문서는 프론트엔드에서 백엔드와의 통신에 사용된 모든 기술, 라이브러리, 연동 방식, 그리고 현재 상태를 상세히 기술합니다.

---

## 1. 통신 방식 개요

프론트엔드는 두 가지 주요 통신 방식을 사용합니다:

1. **HTTP REST API** - 세션 생성, 인증 등 초기 설정
2. **WebSocket** - 실시간 양방향 통신 (음성 스트리밍, 텍스트 메시지, STT/TTS)

---

## 2. 사용된 라이브러리 및 기술

### 2.1 핵심 라이브러리

#### WebSocket 통신
- **네이티브 WebSocket API** (`window.WebSocket`)
  - 별도의 라이브러리 없이 브라우저 네이티브 API 사용
  - Binary 및 Text 메시지 모두 지원
  - `binaryType: 'arraybuffer'` 설정으로 오디오 데이터 처리

#### HTTP 통신
- **Fetch API** (`window.fetch`)
  - 네이티브 Fetch API 사용
  - Axios 등 외부 라이브러리 미사용
  - RESTful API 호출에 사용

#### 오디오 처리
- **Web Audio API** (`AudioContext`, `ScriptProcessorNode`)
  - 실시간 오디오 캡처 및 PCM 변환
  - 16kHz 샘플레이트, Mono 채널
  - Float32 → Int16 변환

- **MediaRecorder API**
  - 백업용으로 유지 (실제 사용은 AudioContext)
  - 브라우저 호환성 확보

- **MediaDevices API** (`navigator.mediaDevices.getUserMedia`)
  - 마이크 권한 요청 및 오디오 스트림 획득

#### 텍스트 음성 변환 (TTS)
- **Web Speech API** (`window.speechSynthesis`)
  - 브라우저 네이티브 TTS 사용
  - 별도 라이브러리 없음

### 2.2 React 관련 라이브러리

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0"
}
```

### 2.3 UI 라이브러리

```json
{
  "@mui/material": "^6.1.6",
  "@mui/icons-material": "^6.1.6",
  "@emotion/react": "^11.13.3",
  "@emotion/styled": "^11.13.0"
}
```

### 2.4 3D 아바타 렌더링

```json
{
  "@react-three/fiber": "^8.18.0",
  "@react-three/drei": "^9.122.0",
  "three": "^0.169.0"
}
```

### 2.5 빌드 도구

```json
{
  "vite": "^6.0.1",
  "@vitejs/plugin-react": "^4.3.3"
}
```

---

## 3. 환경 변수 설정

### 3.1 사용되는 환경 변수

```javascript
// frontend-web/src/features/roleplay/api/roleplayApi.js

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'
const FASTAPI_WS_URL = import.meta.env.VITE_FASTAPI_WS_URL || 'ws://localhost:8082'
```

### 3.2 환경 변수 설정 방법

Vite는 `VITE_` 접두사가 필요합니다. `.env` 파일에 다음과 같이 설정:

```env
VITE_GATEWAY_URL=http://localhost:8080
VITE_FASTAPI_WS_URL=ws://localhost:8082
```

---

## 4. HTTP REST API 통신

### 4.1 API 엔드포인트

#### JWT 토큰 생성
```javascript
GET ${GATEWAY_URL}/auth/test/token/${userId}
```

**위치**: `frontend-web/src/features/roleplay/api/roleplayApi.js`
- **함수**: `getJwtToken(userId = 1)`
- **응답**: `{ accessToken: string }`
- **용도**: 테스트용 JWT 토큰 발급

#### 세션 생성
```javascript
POST ${GATEWAY_URL}/roleplaying/sessions
Headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${jwtToken}`
}
Body: {
  scenarioId: number
}
```

**위치**: `frontend-web/src/features/roleplay/api/roleplayApi.js`
- **함수**: `startSession(jwtToken, scenarioId)`
- **응답**: 
  ```json
  {
    "session_id": "string",
    "ws_url": "ws://...",
    "scenario": {
      "subject_id": "number",
      "my_role": "string",
      "ai_role": "string",
      "fixed_questions": ["string"]
    }
  }
  ```

### 4.2 HTTP 통신 구현

```javascript
// fetch API 사용 예시
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
  throw new Error(`세션 생성 실패 (${response.status}): ${errorText}`)
}

const data = await response.json()
```

---

## 5. WebSocket 통신

### 5.1 WebSocket 연결 생성

**위치**: `frontend-web/src/features/roleplay/api/roleplayApi.js`

```javascript
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
    // Binary 데이터는 무시 (오디오는 클라이언트 → 서버만)
    if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
      return
    }
    
    // JSON 메시지 파싱
    const message = JSON.parse(event.data)
    onMessage(message)
  }
  
  ws.onerror = (error) => {
    onError(error)
  }
  
  ws.onclose = () => {
    onClose()
  }
  
  return ws
}
```

### 5.2 WebSocket 연결 흐름

1. **세션 생성** → `ws_url` 획득
2. **WebSocket 연결** → `createWebSocketConnection()` 호출
3. **INIT 메시지 전송** → 연결 완료 시 자동 전송
4. **메시지 수신/전송** → 실시간 양방향 통신

### 5.3 클라이언트 → 서버 메시지

#### INIT 메시지
```json
{
  "type": "INIT",
  "userId": 1,
  "subjectId": number,
  "myRole": "string",
  "aiRole": "string",
  "fixedQuestions": ["string"]
}
```

#### USER_TEXT 메시지 (키보드 입력)
```json
{
  "type": "USER_TEXT",
  "text": "string"
}
```

#### UTTERANCE_END 메시지
```json
{
  "type": "UTTERANCE_END"
}
```

#### END_SESSION 메시지
```json
{
  "type": "END_SESSION"
}
```

#### Binary 오디오 데이터
- **형식**: `ArrayBuffer` (Int16 PCM)
- **샘플레이트**: 16kHz
- **채널**: Mono
- **전송 방식**: 실시간 스트리밍 (약 64ms 간격, 1024 bytes)

### 5.4 서버 → 클라이언트 메시지

#### ACK (초기화 확인)
```json
{
  "type": "ACK",
  "message": "Session initialized"
}
```

#### AI_TEXT (완성된 AI 응답)
```json
{
  "type": "AI_TEXT",
  "text": "string",
  "is_fixed_question": boolean
}
```

#### AI_TEXT_STREAMING (스트리밍 AI 응답)
```json
{
  "type": "AI_TEXT_STREAMING",
  "chunk": "string",
  "is_fixed_question": boolean
}
```

#### AI_TYPING (AI 타이핑 중)
```json
{
  "type": "AI_TYPING"
}
```

#### STT_PARTIAL (STT 부분 결과)
```json
{
  "type": "STT_PARTIAL",
  "text": "string"
}
```

#### STT_FINAL (STT 최종 결과)
```json
{
  "type": "STT_FINAL",
  "text": "string"
}
```

#### UTTERANCE_SAVED (발화 저장 확인)
```json
{
  "type": "UTTERANCE_SAVED"
}
```

#### SESSION_ENDED (세션 종료)
```json
{
  "type": "SESSION_ENDED"
}
```

#### ERROR (에러)
```json
{
  "type": "ERROR",
  "code": "string",
  "message": "string"
}
```

**에러 코드**:
- `SILENCE_DETECTED`: 음성 미감지
- `SESSION_NOT_INITIALIZED`: 세션 미초기화

---

## 6. 오디오 스트리밍 구현

### 6.1 오디오 캡처

**위치**: `frontend-web/src/features/roleplay/hooks/useRoleplaySession.js`

```javascript
// 마이크 권한 요청
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: {
    channelCount: 1,      // Mono
    sampleRate: 16000,    // 16kHz
    echoCancellation: true,
    noiseSuppression: true
  } 
})
```

### 6.2 PCM 변환 및 전송

```javascript
// AudioContext 초기화
const audioContext = new AudioContext({ sampleRate: 16000 })

// MediaStream을 AudioContext에 연결
const sourceNode = audioContext.createMediaStreamSource(stream)

// ScriptProcessorNode로 PCM 데이터 추출
const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

scriptProcessor.onaudioprocess = (event) => {
  const channelData = event.inputBuffer.getChannelData(0) // Mono
  
  // Float32 → Int16 변환
  const pcmData = new Int16Array(channelData.length)
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
  }
  
  // WebSocket으로 전송
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(pcmData.buffer)
  }
}
```

### 6.3 오디오 전송 타이밍

- **첫 청크**: 200ms 지연 후 전송
- **이후 청크**: 즉시 전송
- **버퍼 크기**: 4096 샘플
- **전송 간격**: 약 64ms (16kHz 기준)

---

## 7. 메시지 처리 로직

### 7.1 메시지 핸들러

**위치**: `frontend-web/src/features/roleplay/hooks/useRoleplaySession.js`

```javascript
const handleWebSocketMessage = (message) => {
  switch (message.type) {
    case 'ACK':
      // 세션 초기화 완료
      setIsInitialized(true)
      break
    
    case 'AI_TEXT':
      // 완성된 AI 응답 표시
      setMessages(prev => [...prev, {
        who: 'AI',
        text: message.text,
        isStreaming: false
      }])
      // TTS 재생
      speakText(message.text)
      break
    
    case 'AI_TEXT_STREAMING':
      // 스트리밍 AI 응답 업데이트
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage?.who === 'AI' && lastMessage.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: lastMessage.text + message.chunk, isStreaming: true }
          ]
        }
        return [...prev, { who: 'AI', text: message.chunk, isStreaming: true }]
      })
      break
    
    case 'STT_PARTIAL':
      // STT 부분 결과 표시
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage?.who === 'You' && lastMessage.isSTT) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: message.text, isSTT: true }
          ]
        }
        return [...prev, { who: 'You', text: message.text, isSTT: true }]
      })
      break
    
    case 'STT_FINAL':
      // STT 최종 결과로 업데이트
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage?.who === 'You' && lastMessage.isSTT) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: message.text, isSTT: false }
          ]
        }
        return prev
      })
      break
    
    // ... 기타 메시지 타입 처리
  }
}
```

### 7.2 스트리밍 완료 감지

```javascript
// 1초 동안 새로운 청크가 없으면 완료로 간주
streamingTimeoutRef.current = setTimeout(() => {
  setMessages(prev => {
    const lastMessage = prev[prev.length - 1]
    if (lastMessage?.who === 'AI' && lastMessage.isStreaming) {
      return [
        ...prev.slice(0, -1),
        { ...lastMessage, isStreaming: false }
      ]
    }
    return prev
  })
  // TTS 재생
  speakText(completedMessage.text)
}, 1000)
```

---

## 8. TTS (Text-to-Speech) 구현

### 8.1 Web Speech API 사용

```javascript
const speakText = (text) => {
  // 기존 TTS 중단
  if (currentUtteranceRef.current) {
    window.speechSynthesis.cancel()
  }
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0
  
  utterance.onstart = () => {
    setIsTTSPlaying(true)
  }
  
  utterance.onend = () => {
    setIsTTSPlaying(false)
    currentUtteranceRef.current = null
  }
  
  utterance.onerror = () => {
    setIsTTSPlaying(false)
    currentUtteranceRef.current = null
  }
  
  window.speechSynthesis.speak(utterance)
  currentUtteranceRef.current = utterance
}
```

### 8.2 TTS 재생 타이밍

- **AI_TEXT**: 타이핑 효과 완료 후 재생 (텍스트 길이 * 30ms + 500ms)
- **AI_TEXT_STREAMING**: 스트리밍 완료 후 재생

---

## 9. 상태 관리

### 9.1 주요 상태 변수

```javascript
const [isSession, setIsSession] = useState(false)           // 세션 활성화 여부
const [messages, setMessages] = useState([])                 // 대화 메시지 목록
const [wsConnection, setWsConnection] = useState(null)      // WebSocket 연결 인스턴스
const [sessionInfo, setSessionInfo] = useState(null)         // 세션 정보
const [isInitialized, setIsInitialized] = useState(false)   // 세션 초기화 완료 여부
const [isRecording, setIsRecording] = useState(false)        // 녹음 중 여부
const [isTTSPlaying, setIsTTSPlaying] = useState(false)     // TTS 재생 중 여부
const [isAvatarLoaded, setIsAvatarLoaded] = useState(false)  // 아바타 로드 완료 여부
```

### 9.2 Ref를 사용한 상태 관리

```javascript
const mediaRecorderRef = useRef(null)        // MediaRecorder 인스턴스
const audioStreamRef = useRef(null)           // 오디오 스트림
const sttPartialTextRef = useRef('')          // STT 부분 결과
const currentUtteranceRef = useRef(null)      // 현재 TTS utterance
const streamingTimeoutRef = useRef(null)      // 스트리밍 타임아웃
const aiTypingTimeoutRef = useRef(null)        // AI 타이핑 타임아웃
const isRecordingRef = useRef(false)          // 녹음 상태 (cleanup용)
```

---

## 10. 에러 처리

### 10.1 WebSocket 에러 처리

```javascript
const handleWebSocketError = (error) => {
  // 녹음 중지
  if (isRecording) {
    stopRecording()
  }
  
  // 상태 초기화
  setIsInitialized(false)
  setIsAvatarLoaded(false)
  
  alert('연결 오류가 발생했습니다. 다시 시도해주세요.')
}
```

### 10.2 HTTP API 에러 처리

```javascript
try {
  const response = await fetch(url, options)
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`요청 실패 (${response.status}): ${errorText}`)
  }
  
  const data = await response.json()
  return data
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    throw new Error(`백엔드 서버에 연결할 수 없습니다. URL: ${url}`)
  }
  throw error
}
```

### 10.3 오디오 에러 처리

```javascript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('마이크 권한이 필요합니다.')
  } else if (error.name === 'NotFoundError') {
    alert('마이크를 찾을 수 없습니다.')
  } else {
    alert(`녹음 시작 실패: ${error.message}`)
  }
}
```

---

## 11. 세션 생명주기

### 11.1 세션 시작

1. 마이크 권한 확인
2. JWT 토큰 생성 (`getJwtToken`)
3. 세션 생성 (`startSession`)
4. WebSocket 연결 (`createWebSocketConnection`)
5. INIT 메시지 전송
6. ACK 수신 대기
7. 세션 활성화

### 11.2 세션 종료

1. TTS 중단
2. 녹음 중지
3. UTTERANCE_END 전송 (녹음 중인 경우)
4. END_SESSION 전송
5. WebSocket 연결 종료
6. 상태 초기화
7. 피드백 화면으로 이동

### 11.3 컴포넌트 언마운트 시 정리

```javascript
useEffect(() => {
  return () => {
    // TTS 중단
    stopTTS()
    
    // 녹음 중지
    if (isRecordingRef.current) {
      stopRecording()
    }
    
    // WebSocket 종료
    if (wsConnection) {
      if (wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({ type: 'END_SESSION' }))
        setTimeout(() => {
          wsConnection.close()
        }, 100)
      } else {
        wsConnection.close()
      }
    }
    
    // 타임아웃 정리
    clearTimeout(streamingTimeoutRef.current)
    clearTimeout(aiTypingTimeoutRef.current)
    clearTimeout(sttTimeoutRef.current)
  }
}, [])
```

---

## 12. 주요 파일 구조

```
frontend-web/src/
├── features/
│   └── roleplay/
│       ├── api/
│       │   └── roleplayApi.js          # HTTP API 및 WebSocket 연결 함수
│       └── hooks/
│           └── useRoleplaySession.js   # 세션 관리 및 메시지 처리 로직
└── main.jsx                            # 앱 진입점
```

---

## 13. 연동 상태

### 13.1 현재 구현 상태

✅ **완료된 기능**:
- HTTP REST API 통신 (JWT 토큰, 세션 생성)
- WebSocket 연결 및 메시지 처리
- 오디오 스트리밍 (PCM 변환 및 전송)
- STT 실시간 표시 (부분/최종 결과)
- AI 응답 스트리밍
- TTS 재생
- 에러 처리
- 세션 생명주기 관리

### 13.2 환경 변수 기본값

- **GATEWAY_URL**: `http://localhost:8080`
- **FASTAPI_WS_URL**: `ws://localhost:8082`

### 13.3 브라우저 호환성

**⚠️ 중요**: 이 프로젝트는 **Chrome 브라우저(데스크톱 및 모바일)만 지원**합니다.

#### Chrome 브라우저 지원 현황

| 기능 | 데스크톱 Chrome | 모바일 Chrome (Android) | 상태 |
|------|----------------|----------------------|------|
| **WebSocket** | ✅ | ✅ | 완전 지원 |
| **Web Audio API** | ✅ | ✅ | 완전 지원 |
| **ScriptProcessorNode** | ✅ (deprecated지만 작동) | ✅ | 작동 (향후 AudioWorklet 권장) |
| **AudioWorklet** | ✅ | ✅ | 지원 (향후 마이그레이션 권장) |
| **MediaRecorder** | ✅ | ✅ | 완전 지원 |
| **getUserMedia** | ✅ | ✅ | 완전 지원 (HTTPS 권장) |
| **Web Speech API (TTS)** | ✅ | ✅ | 완전 지원 |
| **AudioContext** | ✅ | ✅ | 완전 지원 |

**결론**: Chrome 브라우저에서는 모든 기능이 정상 작동합니다.

---

## 14. Chrome 브라우저 환경 이슈 및 주의사항

> **✅ 좋은 소식**: Chrome 브라우저(데스크톱 및 모바일)에서는 모든 기능이 정상 작동합니다.

### 14.1 Chrome 모바일 웹 환경 주의사항

#### ⚠️ 네트워크 불안정성
**문제**:
- 모바일 네트워크는 불안정할 수 있음
- WebSocket 연결 끊김이 빈번할 수 있음

**현재 상태**:
- ❌ 자동 재연결 로직 없음
- 수동 재시도 필요

**권장 사항**:
- 자동 재연결 로직 구현
- 연결 상태 모니터링 UI 추가

#### ⚠️ 배터리 및 성능 이슈
**문제**:
- 실시간 오디오 스트리밍이 배터리 소모가 큼
- 저사양 기기에서 성능 저하 가능

**현재 상태**:
- 오디오 스트리밍 최적화 필요
- 버퍼 크기 및 샘플레이트 조정 가능

**권장 사항**:
- 배터리 상태 모니터링
- 성능 저하 시 품질 조정 옵션 제공

#### ⚠️ 백그라운드 제한
**문제**:
- 모바일 Chrome은 백그라운드에서 오디오 처리 제한
- 앱 전환 시 WebSocket 연결 끊김 가능

**현재 상태**:
- 백그라운드 처리 로직 없음

**권장 사항**:
- Page Visibility API로 상태 감지
- 백그라운드 진입 시 연결 유지 또는 일시정지

#### ⚠️ 배터리 및 성능 이슈
**문제**:
- 실시간 오디오 스트리밍이 배터리 소모가 큼
- 저사양 기기에서 성능 저하

**해결 방안**:
- 버퍼 크기 조정
- 샘플레이트 낮추기 (16kHz → 8kHz)
- 전송 간격 조정

#### ⚠️ 네트워크 불안정
**문제**:
- 모바일 네트워크는 불안정할 수 있음
- WebSocket 연결 끊김 빈번

**해결 방안**:
- 자동 재연결 로직 구현
- 연결 상태 모니터링
- 오프라인 감지 및 재시도

### 14.2 Chrome 공통 주의사항

#### ⚠️ HTTPS 권장
**현재 상태**:
- `getUserMedia`는 HTTPS 환경에서만 작동 (localhost 제외)
- 프로덕션 환경에서는 HTTPS 필수

**권장 사항**:
- 프로덕션: HTTPS 사용
- 개발: `localhost` 사용 또는 SSL 인증서 설정

#### ⚠️ 권한 요청 처리
**현재 상태**:
- 권한 거부 시 재요청 어려움
- 사용자 안내 메시지 제공

**권장 사항**:
```javascript
// 권한 상태 확인 및 안내
const checkMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      alert('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.')
    }
    return false
  }
}
```

---

## 15. 주의사항 및 제한사항

### 15.1 오디오 처리

- **ScriptProcessorNode**는 deprecated되었지만 Chrome에서 작동
- ✅ **Chrome 지원**: 현재 코드 정상 작동
- 권장: AudioWorklet로 마이그레이션 고려 (향후 대비)

### 15.2 TTS

- Chrome에서 Web Speech API 완전 지원
- ✅ **Chrome 지원**: 현재 코드 정상 작동
- 브라우저별 음성 품질 차이는 있으나 사용 가능

### 15.3 WebSocket

- 자동 재연결 로직 없음 (수동 재시도 필요)
- ⚠️ **모바일 네트워크 불안정**: 자동 재연결 권장
- 연결 끊김 시 사용자 알림 및 재연결 유도

### 15.4 타임아웃 설정

- **AI 타이핑 타임아웃**: 35초
- **스트리밍 완료 감지**: 1초
- **STT 타임아웃**: 5초
- ⚠️ **모바일 네트워크**: 타임아웃 값 증가 고려 (선택사항)

### 15.5 모바일 성능 (Chrome)

- ⚠️ **배터리 소모**: 실시간 오디오 스트리밍이 배터리 소모 큼
- ⚠️ **저사양 기기**: 성능 최적화 필요 (선택사항)
- ⚠️ **백그라운드 제한**: 앱 전환 시 연결 유지 어려움 (선택사항)

---

## 16. Chrome 브라우저 개선 우선순위

> **✅ 현재 상태**: Chrome 브라우저에서는 모든 핵심 기능이 정상 작동합니다.

### 🟡 중요 (기능 개선)

1. **WebSocket 자동 재연결** ⚠️ **권장**
   - 모바일 네트워크 불안정 대응
   - 연결 상태 모니터링 UI 추가
   - 현재: 수동 재시도만 가능

2. **AudioWorklet 마이그레이션** ⚠️ **권장**
   - ScriptProcessorNode는 deprecated
   - 향후 브라우저 지원 중단 가능성
   - 성능 개선 효과

3. **권한 처리 개선**
   - 권한 상태 확인
   - 거부 시 안내 메시지 개선

### 🟢 개선 (UX 향상)

4. **배터리 최적화**
   - 버퍼 크기 조정 옵션
   - 샘플레이트 옵션 제공
   - 모바일 환경 최적화

5. **백그라운드 처리**
   - Page Visibility API 활용
   - 연결 유지 또는 일시정지
   - 앱 전환 시 상태 관리

6. **모바일 UI 최적화**
   - 터치 인터랙션 개선
   - 화면 크기 대응
   - 반응형 디자인 강화

7. **연결 상태 표시**
   - WebSocket 연결 상태 UI
   - 네트워크 상태 표시
   - 재연결 진행 상황 표시

---

## 17. 향후 개선 사항

1. **WebSocket 자동 재연결** 구현 (모바일 필수)
2. **AudioWorklet**로 오디오 처리 마이그레이션 (iOS Safari 필수)
3. **서버 측 TTS** 구현 (iOS Safari 필수)
4. **에러 복구 메커니즘** 강화
5. **연결 상태 표시** UI 추가
6. **오디오 품질 설정** 옵션 추가
7. **모바일 네트워크 최적화** (타임아웃, 버퍼 조정)
8. **MediaRecorder 코덱 자동 감지** (iOS Safari 대응)

---

## 16. 참고 자료

- [WebSocket API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaRecorder API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Fetch API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**문서 작성일**: 2024년
**최종 업데이트**: 2024년
**작성자**: AI Assistant

