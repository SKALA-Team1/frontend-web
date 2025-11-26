# ScriptProcessorNode → AudioWorklet 마이그레이션 가이드

## ScriptProcessorNode란?

### 간단 설명

**ScriptProcessorNode**는 Web Audio API에서 오디오 데이터를 실시간으로 처리하기 위한 노드입니다.

- **역할**: 오디오 스트림의 각 청크를 JavaScript로 처리
- **동작 방식**: 메인 스레드에서 실행되어 오디오 버퍼를 처리
- **상태**: ⚠️ **Deprecated** (더 이상 권장되지 않음)

### 작동 원리

```
마이크 입력 → AudioContext → ScriptProcessorNode → JavaScript 처리 → WebSocket 전송
```

1. 마이크에서 오디오 스트림 수신
2. AudioContext가 오디오를 버퍼 단위로 분할
3. `onaudioprocess` 이벤트가 각 버퍼마다 호출
4. JavaScript에서 Float32 → Int16 변환
5. WebSocket으로 PCM 데이터 전송

---

## 현재 프로젝트에서의 사용 위치

### 파일 위치
`frontend-web/src/features/roleplay/hooks/useRoleplaySession.js`

### 사용 코드 (663-707줄)

```javascript
// ScriptProcessorNode를 사용하여 PCM 데이터 추출
const bufferSize = 4096 // 버퍼 크기
scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)

// PCM 데이터 처리
scriptProcessor.onaudioprocess = (event) => {
  // WebSocket 연결 상태 확인
  const currentWs = wsConnection
  if (!currentWs || currentWs.readyState === WebSocket.OPEN || !isInitialized) {
    return
  }
  
  // AudioBuffer에서 PCM 데이터 추출
  const inputBuffer = event.inputBuffer
  const channelData = inputBuffer.getChannelData(0) // mono
  
  // Float32 → Int16 변환
  const pcmData = new Int16Array(channelData.length)
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
  }
  
  // WebSocket으로 전송
  if (currentWs && currentWs.readyState === WebSocket.OPEN && isInitialized) {
    currentWs.send(pcmData.buffer)
  }
}

// 연결
sourceNode.connect(scriptProcessor)
scriptProcessor.connect(audioContext.destination)
```

### 사용 목적

1. **마이크 오디오 캡처**: `getUserMedia`로 받은 오디오 스트림 처리
2. **PCM 변환**: Float32 오디오 데이터를 Int16 PCM으로 변환
3. **실시간 전송**: 변환된 데이터를 WebSocket으로 실시간 전송 (약 64ms 간격)

---

## ScriptProcessorNode의 문제점

### 1. 성능 문제 ⚠️

- **메인 스레드 실행**: JavaScript가 메인 스레드에서 실행되어 UI 블로킹 가능
- **지연 발생**: 메인 스레드가 바쁘면 오디오 처리 지연
- **드롭아웃**: 처리 지연 시 오디오 드롭아웃 발생 가능

### 2. Deprecated 상태

- **공식 지원 중단**: W3C에서 더 이상 권장하지 않음
- **향후 제거 가능**: 브라우저에서 제거될 수 있음
- **대체 기술**: AudioWorklet로 대체 권장

### 3. 제한사항

- **버퍼 크기 제한**: 256, 512, 1024, 2048, 4096, 8192, 16384만 가능
- **지연 시간**: 메인 스레드 처리로 인한 지연
- **정확도**: 타이밍 정확도가 낮음

---

## AudioWorklet로 교체

### AudioWorklet이란?

**AudioWorklet**은 ScriptProcessorNode의 현대적인 대체 기술입니다.

- **역할**: 오디오 데이터를 별도 워커 스레드에서 처리
- **장점**: 
  - ✅ 메인 스레드와 분리되어 UI 블로킹 없음
  - ✅ 더 낮은 지연 시간
  - ✅ 더 정확한 타이밍
  - ✅ 공식 권장 기술

### 작동 원리

```
마이크 입력 → AudioContext → AudioWorklet (워커 스레드) → WebSocket 전송
```

1. AudioWorklet 프로세서를 워커 스레드에 로드
2. 오디오 처리가 워커 스레드에서 실행
3. 메시지 포트를 통해 메인 스레드와 통신
4. WebSocket 전송은 메인 스레드에서 처리

---

## 마이그레이션 방법

### 1단계: AudioWorklet 프로세서 파일 생성

**파일**: `frontend-web/public/audio-processor.js`

```javascript
// AudioWorklet 프로세서 (워커 스레드에서 실행)
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.bufferSize = 4096
    this.buffer = new Float32Array(this.bufferSize)
    this.bufferIndex = 0
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    
    if (input.length > 0) {
      const inputChannel = input[0] // Mono
      
      // 버퍼에 데이터 누적
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannel[i]
        
        // 버퍼가 가득 차면 메인 스레드로 전송
        if (this.bufferIndex >= this.bufferSize) {
          // Float32 → Int16 변환
          const pcmData = new Int16Array(this.bufferSize)
          for (let j = 0; j < this.bufferSize; j++) {
            const sample = Math.max(-1, Math.min(1, this.buffer[j]))
            pcmData[j] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
          }
          
          // 메인 스레드로 전송
          this.port.postMessage({
            type: 'audioData',
            data: pcmData.buffer
          })
          
          this.bufferIndex = 0
        }
      }
    }
    
    return true // 계속 실행
  }
}

registerProcessor('audio-processor', AudioProcessor)
```

### 2단계: useRoleplaySession.js 수정

**기존 코드 (ScriptProcessorNode)**:
```javascript
// ❌ 기존 방식
const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
scriptProcessor.onaudioprocess = (event) => {
  // 처리 로직
}
```

**새로운 코드 (AudioWorklet)**:
```javascript
// ✅ AudioWorklet 방식
try {
  // AudioWorklet 프로세서 로드
  await audioContext.audioWorklet.addModule('/audio-processor.js')
  
  // AudioWorkletNode 생성
  const workletNode = new AudioWorkletNode(audioContext, 'audio-processor')
  
  // 메시지 수신 (워커 스레드에서 처리된 데이터)
  workletNode.port.onmessage = (event) => {
    if (event.data.type === 'audioData') {
      const pcmData = event.data.data
      
      // WebSocket으로 전송
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN && isInitialized) {
        wsConnection.send(pcmData)
      }
    }
  }
  
  // 연결
  sourceNode.connect(workletNode)
  // destination 연결 불필요 (워커 스레드에서 처리)
  
  // 정리 시
  workletNode.port.close()
  workletNode.disconnect()
} catch (error) {
  // AudioWorklet 미지원 시 ScriptProcessorNode 폴백
  console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode')
  // 기존 ScriptProcessorNode 코드
}
```

### 3단계: 폴백 처리

Chrome에서도 AudioWorklet이 지원되지 않을 수 있으므로 폴백 제공:

```javascript
const useAudioWorklet = async (audioContext, sourceNode, wsConnection, isInitialized) => {
  try {
    // AudioWorklet 시도
    await audioContext.audioWorklet.addModule('/audio-processor.js')
    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor')
    
    workletNode.port.onmessage = (event) => {
      if (event.data.type === 'audioData' && 
          wsConnection && 
          wsConnection.readyState === WebSocket.OPEN && 
          isInitialized) {
        wsConnection.send(event.data.data)
      }
    }
    
    sourceNode.connect(workletNode)
    return { workletNode, cleanup: () => {
      workletNode.port.close()
      workletNode.disconnect()
    }}
  } catch (error) {
    // 폴백: ScriptProcessorNode 사용
    console.warn('AudioWorklet failed, using ScriptProcessorNode:', error)
    return useScriptProcessorNode(audioContext, sourceNode, wsConnection, isInitialized)
  }
}
```

---

## 성능 비교

| 항목 | ScriptProcessorNode | AudioWorklet |
|------|---------------------|--------------|
| **실행 스레드** | 메인 스레드 | 워커 스레드 |
| **UI 블로킹** | 가능 | 없음 |
| **지연 시간** | 높음 (~10-20ms) | 낮음 (~1-5ms) |
| **타이밍 정확도** | 낮음 | 높음 |
| **CPU 사용률** | 높음 | 낮음 |
| **상태** | Deprecated | 공식 권장 |

---

## 마이그레이션 체크리스트

- [ ] AudioWorklet 프로세서 파일 생성 (`public/audio-processor.js`)
- [ ] `useRoleplaySession.js`에서 ScriptProcessorNode 제거
- [ ] AudioWorklet 로드 및 노드 생성 로직 추가
- [ ] 메시지 포트를 통한 데이터 수신 처리
- [ ] ScriptProcessorNode 폴백 로직 추가 (선택사항)
- [ ] 정리(cleanup) 로직 수정
- [ ] 테스트 (데스크톱 Chrome, 모바일 Chrome)

---

## 참고 자료

- [AudioWorklet - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [ScriptProcessorNode - MDN (Deprecated)](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**문서 작성일**: 2024년
**최종 업데이트**: 2024년

