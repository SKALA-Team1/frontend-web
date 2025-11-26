# WebSocket 라이브러리 비교 가이드

## 개요

이 문서는 현재 프로젝트에서 사용 중인 **네이티브 WebSocket API**와 다른 WebSocket 라이브러리들(`websocket`, `ws`, `socket.io` 등)을 비교합니다.

---

## 현재 프로젝트에서 사용 중인 방식

### 네이티브 WebSocket API

**사용 위치**: `frontend-web/src/features/roleplay/api/roleplayApi.js`

```javascript
// 브라우저 네이티브 WebSocket API 사용
const ws = new WebSocket(wsUrl)
ws.binaryType = 'arraybuffer'

ws.onopen = () => { /* ... */ }
ws.onmessage = (event) => { /* ... */ }
ws.onerror = (error) => { /* ... */ }
ws.onclose = () => { /* ... */ }
```

**특징**:
- ✅ **의존성 없음**: 별도 라이브러리 설치 불필요
- ✅ **가벼움**: 번들 크기 증가 없음
- ✅ **표준 프로토콜**: 모든 WebSocket 서버와 호환
- ✅ **직접 제어**: 모든 기능을 직접 구현 가능
- ❌ **자동 재연결 없음**: 직접 구현 필요
- ❌ **JSON 파싱 수동**: 직접 처리 필요
- ❌ **에러 처리 수동**: 모든 에러 케이스 직접 처리

---

## 주요 WebSocket 라이브러리 비교

### 1. `websocket` (npm 패키지)

**설치**: `npm install websocket`

**특징**:
- 브라우저와 Node.js 양쪽 지원
- 네이티브 WebSocket API의 래퍼
- 추가 기능 제공 (자동 재연결, 이벤트 기반 등)

**사용 예시**:
```javascript
import { w3cwebsocket as W3CWebSocket } from 'websocket'

const ws = new W3CWebSocket('ws://localhost:8082')

ws.onopen = () => {
  console.log('Connected')
}

ws.onmessage = (message) => {
  console.log('Received:', message.data)
}
```

**현재 프로젝트와 비교**:
| 항목 | 네이티브 WebSocket | websocket 라이브러리 |
|------|-------------------|---------------------|
| 번들 크기 | 0KB (내장) | ~50KB 추가 |
| 기능 | 기본 기능만 | 추가 유틸리티 제공 |
| 호환성 | 모든 브라우저 | 모든 브라우저 + Node.js |
| 사용 난이도 | 중간 | 쉬움 |

---

### 2. `ws` (Node.js 전용)

**설치**: `npm install ws`

**특징**:
- **Node.js 서버 측 전용**
- 브라우저에서는 사용 불가
- 가볍고 빠름

**사용 예시** (서버 측):
```javascript
import WebSocket from 'ws'

const wss = new WebSocket.Server({ port: 8082 })

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message)
  })
})
```

**현재 프로젝트와 비교**:
- ❌ **프론트엔드에서 사용 불가** (Node.js 전용)
- 현재 프로젝트는 브라우저 환경이므로 사용 불가

---

### 3. `socket.io-client`

**설치**: `npm install socket.io-client`

**특징**:
- 자동 재연결
- 이벤트 기반 메시지 처리
- 폴링 폴백 지원 (WebSocket 실패 시)
- 브로드캐스팅, 룸 기능 등

**사용 예시**:
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:8082')

socket.on('connect', () => {
  console.log('Connected')
})

socket.on('message', (data) => {
  console.log('Received:', data)
})

socket.emit('customEvent', { data: 'value' })
```

**현재 프로젝트와 비교**:
| 항목 | 네이티브 WebSocket | Socket.IO |
|------|-------------------|-----------|
| 프로토콜 | 표준 WebSocket | Socket.IO 프로토콜 (WebSocket 기반) |
| 서버 요구사항 | 표준 WebSocket 서버 | Socket.IO 서버 필요 |
| 자동 재연결 | ❌ (직접 구현) | ✅ |
| 이벤트 기반 | ❌ (수동 구현) | ✅ |
| 번들 크기 | 0KB | ~100KB |
| 호환성 | 모든 WebSocket 서버 | Socket.IO 서버만 |

**현재 프로젝트에 적용 시 문제점**:
- ❌ 백엔드가 표준 WebSocket을 사용하므로 Socket.IO와 호환되지 않음
- ❌ 서버 측도 Socket.IO로 변경 필요

---

### 4. `react-use-websocket`

**설치**: `npm install react-use-websocket`

**특징**:
- React 훅 기반
- 자동 재연결
- JSON 자동 파싱
- 표준 WebSocket 프로토콜 사용

**사용 예시**:
```javascript
import useWebSocket from 'react-use-websocket'

function MyComponent() {
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8082', {
    onOpen: () => console.log('Connected'),
    onMessage: (event) => console.log('Received:', event.data),
    shouldReconnect: (closeEvent) => true,
  })

  return (
    <div>
      <button onClick={() => sendMessage(JSON.stringify({ type: 'INIT' }))}>
        Send
      </button>
    </div>
  )
}
```

**현재 프로젝트와 비교**:
| 항목 | 네이티브 WebSocket | react-use-websocket |
|------|-------------------|---------------------|
| React 통합 | 수동 (useState, useEffect) | ✅ 훅으로 제공 |
| 자동 재연결 | ❌ | ✅ |
| JSON 처리 | 수동 | ✅ 자동 |
| 번들 크기 | 0KB | ~20KB |
| 프로토콜 | 표준 WebSocket | 표준 WebSocket (호환) |

**현재 프로젝트에 적용 가능성**:
- ✅ **적용 가능**: 표준 WebSocket 프로토콜 사용
- ✅ 백엔드 변경 불필요
- ✅ 자동 재연결 등 편의 기능 제공

---

### 5. `@stomp/stompjs` (STOMP 프로토콜)

**설치**: `npm install @stomp/stompjs`

**특징**:
- STOMP 프로토콜 사용
- pub/sub 구조
- 메시지 브로커와 통합 용이

**사용 예시**:
```javascript
import { Client } from '@stomp/stompjs'

const client = new Client({
  brokerURL: 'ws://localhost:8082',
  onConnect: () => {
    client.subscribe('/topic/messages', (message) => {
      console.log('Received:', JSON.parse(message.body))
    })
  }
})

client.activate()
```

**현재 프로젝트와 비교**:
- ❌ **프로토콜 불일치**: STOMP 프로토콜 필요
- ❌ 백엔드가 STOMP를 지원하지 않으면 사용 불가

---

## 종합 비교표

| 라이브러리 | 번들 크기 | 자동 재연결 | JSON 지원 | 서버 요구사항 | 현재 프로젝트 적용 가능 |
|-----------|---------|------------|----------|-------------|---------------------|
| **네이티브 WebSocket** (현재) | 0KB | ❌ | ❌ | 표준 WebSocket | ✅ 사용 중 |
| `websocket` | ~50KB | ❌ | ❌ | 표준 WebSocket | ✅ 가능 |
| `ws` | - | ❌ | ❌ | 표준 WebSocket | ❌ (Node.js 전용) |
| `socket.io-client` | ~100KB | ✅ | ✅ | Socket.IO 서버 | ❌ (프로토콜 불일치) |
| `react-use-websocket` | ~20KB | ✅ | ✅ | 표준 WebSocket | ✅ **권장** |
| `@stomp/stompjs` | ~30KB | ✅ | ✅ | STOMP 서버 | ❌ (프로토콜 불일치) |

---

## 현재 프로젝트 분석

### 현재 구현 방식의 장점

1. **의존성 없음**: 번들 크기 최소화
2. **완전한 제어**: 모든 기능을 직접 구현
3. **표준 프로토콜**: 모든 WebSocket 서버와 호환
4. **커스터마이징 용이**: 프로젝트 요구사항에 맞게 최적화

### 현재 구현 방식의 단점

1. **자동 재연결 없음**: 연결 끊김 시 수동 처리 필요
2. **에러 처리 수동**: 모든 에러 케이스 직접 처리
3. **코드 복잡도**: WebSocket 관리 로직이 복잡함

### 현재 프로젝트의 WebSocket 사용 현황

```javascript
// 현재 구현 (roleplayApi.js)
export function createWebSocketConnection(wsUrl, onMessage, onError, onClose, onOpen) {
  const ws = new WebSocket(wsUrl)
  ws.binaryType = 'arraybuffer'  // Binary 데이터 처리
  
  ws.onopen = () => {
    if (onOpen) onOpen(ws)
  }
  
  ws.onmessage = (event) => {
    // Binary 데이터 필터링
    if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
      return
    }
    // JSON 파싱
    const message = JSON.parse(event.data)
    onMessage(message)
  }
  
  ws.onerror = (error) => onError(error)
  ws.onclose = () => onClose()
  
  return ws
}
```

**특징**:
- Binary 데이터 처리 (`arraybuffer` 타입)
- JSON 메시지 자동 파싱
- 에러 핸들링
- 콜백 기반 이벤트 처리

---

## 마이그레이션 고려사항

### `react-use-websocket`로 마이그레이션 시

**장점**:
- 자동 재연결 기능
- React 훅 통합
- JSON 자동 처리
- 코드 간소화

**단점**:
- 번들 크기 증가 (~20KB)
- Binary 데이터 처리 확인 필요
- 기존 코드 리팩토링 필요

**마이그레이션 예시**:
```javascript
// 기존 방식
const ws = createWebSocketConnection(wsUrl, onMessage, onError, onClose, onOpen)

// react-use-websocket 방식
const { sendMessage, lastMessage, readyState } = useWebSocket(wsUrl, {
  onOpen: onOpen,
  onMessage: (event) => {
    const message = JSON.parse(event.data)
    onMessage(message)
  },
  onError: onError,
  onClose: onClose,
  shouldReconnect: () => true,  // 자동 재연결
})
```

---

## 권장사항

### 현재 프로젝트에 적합한 선택

1. **현재 방식 유지** (네이티브 WebSocket)
   - ✅ 이미 잘 작동 중
   - ✅ 번들 크기 최소화
   - ✅ 완전한 제어 가능
   - ⚠️ 자동 재연결만 추가 구현 필요

2. **`react-use-websocket` 도입 고려**
   - ✅ 자동 재연결 등 편의 기능
   - ✅ React 통합 용이
   - ⚠️ Binary 데이터 처리 확인 필요
   - ⚠️ 번들 크기 약간 증가

3. **다른 라이브러리 도입 비권장**
   - ❌ `socket.io`: 프로토콜 불일치
   - ❌ `ws`: 브라우저에서 사용 불가
   - ❌ `@stomp/stompjs`: 프로토콜 불일치

---

## 결론

현재 프로젝트는 **네이티브 WebSocket API**를 사용하고 있으며, 이는 다음과 같은 이유로 적절한 선택입니다:

1. ✅ **표준 프로토콜**: 백엔드와 완벽 호환
2. ✅ **가벼움**: 의존성 없음
3. ✅ **유연성**: 프로젝트 요구사항에 맞게 커스터마이징

**개선 제안**:
- 자동 재연결 기능만 추가하면 완벽
- 또는 `react-use-websocket` 도입 고려 (편의 기능 활용)

---

**문서 작성일**: 2024년
**최종 업데이트**: 2024년

