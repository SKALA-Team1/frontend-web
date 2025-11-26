import { useState, useMemo, useRef, useEffect } from 'react'
import { getJwtToken, startSession, createWebSocketConnection } from '../api/roleplayApi'

/**
 * 롤플레이 세션 관리를 위한 커스텀 훅
 * 
 * 롤플레이 세션의 전체 생명주기를 관리하는 핵심 훅
 * - WebSocket 연결 및 메시지 처리
 * - 오디오 스트리밍 (마이크 입력 → PCM 변환 → 서버 전송)
 * - STT (Speech-to-Text) 실시간 표시
 * - TTS (Text-to-Speech) 음성 재생
 * - 아바타 애니메이션 제어
 * - 세션 상태 관리 (list, session, summary)
 * 
 * @returns {Object} 롤플레이 세션 관련 상태 및 핸들러
 *   - isSession: boolean - 세션 활성화 여부
 *   - messages: Array - 대화 메시지 목록
 *   - selectedTitle: string - 선택된 시나리오 제목
 *   - selectedBody: string - 선택된 시나리오 본문
 *   - view: string - 현재 뷰 상태 ('list' | 'session' | 'summary')
 *   - summaryTab: string - 요약 탭 상태 ('summary' | 'transcript')
 *   - evaluating: boolean - 평가 중 여부
 *   - summary: Object - 세션 요약 정보
 *   - isKeyboardMode: boolean - 키보드 입력 모드 여부
 *   - textInput: string - 텍스트 입력값
 *   - isRecording: boolean - 녹음 중 여부
 *   - isTTSPlaying: boolean - TTS 재생 중 여부
 *   - isAvatarLoaded: boolean - 아바타 로드 완료 여부
 *   - bottomRef: Ref - 메시지 리스트 하단 스크롤용 ref
 *   - startWithMic: Function - 마이크로 세션 시작 핸들러
 *   - startWithKeyboard: Function - 키보드로 세션 시작 핸들러
 *   - endSession: Function - 세션 종료 핸들러
 *   - handleMicToggle: Function - 마이크 토글 핸들러
 *   - sendMessage: Function - 텍스트 메시지 전송 핸들러
 *   - toggleKeyboardMode: Function - 키보드 모드 토글 핸들러
 *   - handleTextInputChange: Function - 텍스트 입력 변경 핸들러
 *   - handleFeedbackView: Function - 피드백 뷰로 전환 핸들러
 *   - handleAvatarLoad: Function - 아바타 로드 완료 핸들러
 */
export default function useRoleplaySession() {
  // 세션 활성화 여부
  const [isSession, setIsSession] = useState(false)
  
  // 대화 메시지 목록 (AI와 사용자의 메시지 포함)
  const [messages, setMessages] = useState([])
  
  // 선택된 시나리오 제목
  const [selectedTitle, setSelectedTitle] = useState('')
  
  // 선택된 시나리오 본문
  const [selectedBody, setSelectedBody] = useState('')
  
  // 현재 뷰 상태 ('list': 시나리오 목록, 'session': 세션 진행, 'summary': 요약)
  const [view, setView] = useState('list')
  
  // 요약 탭 상태 ('summary': 요약, 'transcript': 대화록)
  const [summaryTab, setSummaryTab] = useState('summary')
  
  // 평가 중 여부 (세션 종료 후 분석 중 표시)
  const [evaluating, setEvaluating] = useState(false)
  
  // 세션 요약 정보 (시간, 턴 수, 제안 수)
  const [summary, setSummary] = useState({ time: '10분', turns: 10, suggestions: 3 })
  
  // 키보드 입력 모드 여부
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  
  // 텍스트 입력값 (키보드 모드에서 사용)
  const [textInput, setTextInput] = useState('')
  
  // 녹음 중 여부
  const [isRecording, setIsRecording] = useState(false)
  
  // WebSocket 연결 인스턴스
  const [wsConnection, setWsConnection] = useState(null)
  
  // 세션 정보 (서버에서 받은 세션 메타데이터)
  const [sessionInfo, setSessionInfo] = useState(null)
  
  // 세션 초기화 완료 여부 (WebSocket ACK 수신 후 true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // TTS (Text-to-Speech) 재생 중 여부
  const [isTTSPlaying, setIsTTSPlaying] = useState(false)
  
  // 아바타 3D 모델 로드 완료 여부
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false)
  
  // 아바타 로드 전에 온 첫 질문을 임시 저장하는 ref
  const pendingFirstMessageRef = useRef(null)
  
  // 메시지 리스트 하단 스크롤용 ref
  const bottomRef = useRef(null)
  
  // AI 스트리밍 완료 감지용 타임아웃 ref
  const streamingTimeoutRef = useRef(null)
  
  // AI 타이핑 효과 타임아웃 ref
  const aiTypingTimeoutRef = useRef(null)
  
  // 현재 재생 중인 TTS utterance ref
  const currentUtteranceRef = useRef(null)
  
  // MediaRecorder 인스턴스 ref (백업용, 실제로는 AudioContext 사용)
  const mediaRecorderRef = useRef(null)
  
  // 오디오 스트림 ref (마이크 입력 스트림)
  const audioStreamRef = useRef(null)
  
  // STT (Speech-to-Text) 부분 결과 저장 ref
  const sttPartialTextRef = useRef('')
  
  // STT 부분 결과 타임아웃 ref
  const sttTimeoutRef = useRef(null)
  
  // 녹음 상태 ref (cleanup에서 사용, useState와 별도로 관리)
  const isRecordingRef = useRef(false)
  
  // 아바타 입모양 애니메이션 지연 시작용 타임아웃 ref
  const lipSyncDelayTimeoutRef = useRef(null)
  
  // 아바타 입모양 애니메이션 조기 종료용 타임아웃 ref
  const lipSyncEndTimeoutRef = useRef(null)

  /**
   * 메시지 리스트 자동 스크롤
   * 새 메시지가 추가되거나 세션이 시작/종료될 때 하단으로 스크롤
   */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isSession])

  /**
   * 아바타 입모양 지연 타임아웃 정리 함수
   * TTS 시작 전 지연 시간을 취소
   */
  const clearLipSyncDelay = () => {
    if (lipSyncDelayTimeoutRef.current) {
      clearTimeout(lipSyncDelayTimeoutRef.current)
      lipSyncDelayTimeoutRef.current = null
    }
  }

  /**
   * 아바타 입모양 종료 타임아웃 정리 함수
   * TTS 종료 예상 시간을 취소
   */
  const clearLipSyncEnd = () => {
    if (lipSyncEndTimeoutRef.current) {
      clearTimeout(lipSyncEndTimeoutRef.current)
      lipSyncEndTimeoutRef.current = null
    }
  }

  /**
   * 아바타 입모양 종료 스케줄링 함수
   * 텍스트 길이를 기반으로 TTS 재생 시간을 추정하고, 그에 맞춰 입모양 종료 시간 예약
   * @param {string} text - TTS로 재생할 텍스트
   */
  const scheduleLipSyncEnd = (text = '') => {
    clearLipSyncEnd()
    // 텍스트 길이 기반 재생 시간 추정 (약 60ms/글자, 최소 1500ms)
    const estimatedDuration = Math.max(1500, text.length * 60)
    const leadTime = 1000 // 여유 시간
    const delay = Math.max(0, estimatedDuration - leadTime)
    lipSyncEndTimeoutRef.current = setTimeout(() => {
      setIsTTSPlaying(false)
      lipSyncEndTimeoutRef.current = null
    }, delay)
  }

  /**
   * TTS (Text-to-Speech) 함수
   * AI 메시지를 음성으로 읽어주는 함수
   * 비동기로 처리하여 메시지 표시에 영향 없도록 함
   * 
   * @param {string} text - 음성으로 변환할 텍스트
   */
  const speakText = (text) => {
    // 비동기로 처리하여 메시지 표시에 영향 없도록
    setTimeout(() => {
      try {
        // 이전 TTS 중단
        if (currentUtteranceRef.current) {
          window.speechSynthesis.cancel()
          currentUtteranceRef.current = null
        }
        clearLipSyncDelay()
        clearLipSyncEnd()
        setIsTTSPlaying(false)

        if (!text || text.trim().length === 0) {
          return
        }

        // Web Speech API 사용 가능 여부 확인
        if (!('speechSynthesis' in window)) {
          return
        }

        const utterance = new SpeechSynthesisUtterance(text)
        
        // TTS 옵션 설정
        utterance.lang = 'en-US' // 영어
        utterance.rate = 1.0 // 속도 (0.1 ~ 10, 기본값 1)
        utterance.pitch = 1.0 // 피치 (0 ~ 2, 기본값 1)
        utterance.volume = 1.0 // 볼륨 (0 ~ 1, 기본값 1)

        // 영어 음성 선택 (가능한 경우)
        const voices = window.speechSynthesis.getVoices()
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('English')
        ) || voices.find(voice => voice.lang.startsWith('en'))
        
        if (englishVoice) {
          utterance.voice = englishVoice
        }

        // 이벤트 핸들러
        utterance.onstart = () => {
          clearLipSyncDelay()
          lipSyncDelayTimeoutRef.current = setTimeout(() => {
            setIsTTSPlaying(true)
            scheduleLipSyncEnd(text)
            lipSyncDelayTimeoutRef.current = null
          }, 500) // 지연 후 입모양 시작
        }

        utterance.onend = () => {
          currentUtteranceRef.current = null
          clearLipSyncDelay()
          clearLipSyncEnd()
          setIsTTSPlaying(false)
        }

        utterance.onerror = (error) => {
          currentUtteranceRef.current = null
          clearLipSyncDelay()
          clearLipSyncEnd()
          setIsTTSPlaying(false)
        }

        // TTS 재생
        currentUtteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        currentUtteranceRef.current = null
      }
    }, 0) // 다음 이벤트 루프에서 실행
  }

  /**
   * TTS 중단 함수
   * 현재 재생 중인 TTS를 중단하고 관련 상태를 정리
   */
  const stopTTS = () => {
    if (currentUtteranceRef.current) {
      window.speechSynthesis.cancel()
      currentUtteranceRef.current = null
    }
    clearLipSyncDelay()
    clearLipSyncEnd()
    setIsTTSPlaying(false)
  }

  /**
   * 음성 목록 로드
   * 일부 브라우저(특히 Chrome)에서는 음성 목록이 비동기로 로드되므로
   * onvoiceschanged 이벤트를 통해 로드 완료를 감지
   */
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // 음성 목록이 비어있으면 로드 시도
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          // 음성 목록 로드 완료
        }
      }
    }
  }, [])

  /**
   * WebSocket 메시지 처리 함수
   * 서버에서 받은 WebSocket 메시지를 타입에 따라 처리
   * 
   * 처리하는 메시지 타입:
   * - ACK: 세션 초기화 확인
   * - AI_TEXT: 완성된 AI 응답
   * - AI_TEXT_STREAMING: 스트리밍 AI 응답 (실시간 타이핑 효과)
   * - AI_TYPING: AI 타이핑 중 표시
   * - STT_PARTIAL: STT 부분 결과 (실시간 음성 인식)
   * - STT_FINAL: STT 최종 결과
   * - UTTERANCE_SAVED: 발화 저장 확인
   * - SESSION_ENDED: 세션 종료
   * - ERROR: 에러 메시지
   * 
   * @param {Object} message - WebSocket 메시지 객체
   */
  const handleWebSocketMessage = (message) => {

    switch (message.type) {
      case 'ACK':
        if (message.message === 'Session initialized') {
          setIsInitialized(true)
        }
        break

      case 'AI_TEXT':
        // 기존 방식: 한 번에 전체 메시지 받기 (고정 질문 등)
        // ✅ 첫 질문이고 아바타가 아직 로드되지 않았으면 대기
        if (!isAvatarLoaded && messages.length === 0) {
          pendingFirstMessageRef.current = {
            who: 'AI',
            text: message.text,
            isFixedQuestion: message.is_fixed_question || false,
            isStreaming: false
          }
          // 아바타 로드 완료를 기다림 (handleAvatarLoad에서 처리)
          break
        }
        
        // 아바타가 로드되었거나 첫 질문이 아니면 즉시 표시
        setMessages(prev => [...prev, {
          who: 'AI',
          text: message.text,
          isFixedQuestion: message.is_fixed_question || false,
          isStreaming: false
        }])
        // ✅ 타이핑 효과 완료 후 TTS 재생 (약간의 지연을 두어 타이핑 효과가 보이도록)
        // 타이핑 속도 30ms * 텍스트 길이 + 여유 시간
        const typingDuration = message.text.length * 30 + 500
        setTimeout(() => {
          speakText(message.text)
        }, typingDuration)
        break

      case 'AI_TEXT_STREAMING':
        // ✅ 스트리밍 방식: 청크 단위로 받아서 누적
        // AI_TYPING 타임아웃 취소 (응답이 오고 있으므로)
        if (aiTypingTimeoutRef.current) {
          clearTimeout(aiTypingTimeoutRef.current)
          aiTypingTimeoutRef.current = null
        }
        
        // 이전 스트리밍 타임아웃 취소
        if (streamingTimeoutRef.current) {
          clearTimeout(streamingTimeoutRef.current)
        }
        
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          
          // 마지막 메시지가 AI이고 스트리밍 중이면 업데이트
          if (lastMessage && lastMessage.who === 'AI' && lastMessage.isStreaming) {
            // 텍스트가 실제로 변경된 경우에만 업데이트
            const newText = lastMessage.text + message.chunk
            if (newText === lastMessage.text) {
              return prev // 변경사항 없으면 이전 상태 반환
            }
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                text: newText,
                isStreaming: true
              }
            ]
          } else {
            // 새로운 스트리밍 메시지 시작
            return [
              ...prev,
              {
                who: 'AI',
                text: message.chunk,
                isFixedQuestion: message.is_fixed_question || false,
                isStreaming: true
              }
            ]
          }
        })
        
        // ✅ 스트리밍 완료 감지: 1초 동안 새로운 청크가 없으면 완료로 간주
        streamingTimeoutRef.current = setTimeout(() => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage && lastMessage.who === 'AI' && lastMessage.isStreaming) {
              const completedMessage = {
                ...lastMessage,
                isStreaming: false
              }
              // ✅ 스트리밍 완료 시 TTS 재생
              speakText(completedMessage.text)
              return [
                ...prev.slice(0, -1),
                completedMessage
              ]
            }
            return prev // 변경사항 없으면 이전 상태 반환
          })
          streamingTimeoutRef.current = null
        }, 1000) // 1초 동안 새로운 청크가 없으면 완료로 간주
        break

      case 'UTTERANCE_SAVED':
        // 발화 저장 확인 (UI 업데이트 불필요)
        break

      case 'AI_TYPING':
        // AI 타이핑 중 표시
        // 스트리밍이 시작되면 자동으로 처리되므로 여기서는 처리하지 않음
        
        // ✅ 타임아웃 처리: 35초 후에도 응답이 없으면 fallback 메시지 표시
        if (aiTypingTimeoutRef.current) {
          clearTimeout(aiTypingTimeoutRef.current)
        }
        
        aiTypingTimeoutRef.current = setTimeout(() => {
          // 마지막 메시지 확인
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            // AI 응답이 아직 없거나 스트리밍 중이 아니면 fallback 추가
            if (!lastMessage || lastMessage.who !== 'AI' || !lastMessage.isStreaming) {
              return [
                ...prev,
                {
                  who: 'AI',
                  text: "I'm having trouble generating a response. Could you please rephrase your question?",
                  isFixedQuestion: false,
                  isStreaming: false
                }
              ]
            }
            return prev
          })
          aiTypingTimeoutRef.current = null
        }, 35000) // 35초 타임아웃 (백엔드 타임아웃 30초 + 여유 5초)
        break

      case 'STT_PARTIAL':
        // STT 부분 결과 (실시간으로 표시)
        // STT 타임아웃 리셋 (부분 결과가 오면 정상 작동 중)
        if (sttTimeoutRef.current) {
          clearTimeout(sttTimeoutRef.current)
          sttTimeoutRef.current = null
        }
        
        if (message.text) {
          sttPartialTextRef.current = message.text
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            // 마지막 메시지가 사용자이고 STT 중이면 업데이트
            if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  text: message.text,
                  isSTT: true
                }
              ]
            } else {
              // 새로운 STT 부분 결과
              return [
                ...prev,
                {
                  who: 'You',
                  text: message.text,
                  isSTT: true
                }
              ]
            }
          })
        }
        break

      case 'STT_FINAL':
        // STT 최종 결과
        // STT 타임아웃 정리
        if (sttTimeoutRef.current) {
          clearTimeout(sttTimeoutRef.current)
          sttTimeoutRef.current = null
        }
        sttPartialTextRef.current = ''
        if (message.text && message.text.trim()) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            // 마지막 메시지가 사용자이고 STT 중이면 최종 결과로 업데이트
            if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  text: message.text,
                  isSTT: false
                }
              ]
            } else {
              // 새로운 최종 STT 결과
              return [
                ...prev,
                {
                  who: 'You',
                  text: message.text,
                  isSTT: false
                }
              ]
            }
          })
        } else {
          // Silence 감지: STT 부분 결과 제거
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
              return prev.slice(0, -1)
            }
            return prev
          })
        }
        break

      case 'SESSION_ENDED':
        endSession()
        break

      case 'ERROR':
        // STT 관련 에러인 경우 특별 처리
        if (message.code === 'SILENCE_DETECTED') {
          // Silence 감지는 정보성 메시지이므로 alert 대신 콘솔만 출력
          console.info('음성이 감지되지 않았습니다. 다시 말씀해주세요.')
          // STT 부분 결과 제거
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
              return prev.slice(0, -1)
            }
            return prev
          })
          sttPartialTextRef.current = ''
        } else if (message.code === 'SESSION_NOT_INITIALIZED') {
          // 세션 초기화 에러
          alert('세션 초기화 오류가 발생했습니다. 페이지를 새로고침해주세요.')
          if (isRecording) {
            stopRecording()
          }
        } else {
          // 기타 에러는 alert 표시
          alert(`오류: ${message.message}`)
          // 에러 발생 시 녹음 중지
          if (isRecording) {
            stopRecording()
          }
        }
        stopTTS()
        break

      default:
        // 알 수 없는 메시지 타입 무시
    }
  }

  /**
   * WebSocket 에러 핸들러
   * WebSocket 연결 중 에러가 발생했을 때 호출
   * 
   * 에러 처리 프로세스:
   * 1. 녹음 중이면 녹음 중지 및 리소스 정리
   * 2. 세션 상태 초기화
   * 3. 사용자에게 에러 알림
   * 
   * @param {Error} error - WebSocket 에러 객체
   */
  const handleWebSocketError = (error) => {
    // 녹음 중이면 중지
    if (isRecording) {
      // WebSocket 에러 시에는 UTTERANCE_END를 보낼 필요 없이 바로 정리
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }
      if (sttTimeoutRef.current) {
        clearTimeout(sttTimeoutRef.current)
        sttTimeoutRef.current = null
      }
      setIsRecording(false)
    }
    setIsInitialized(false)
    setIsAvatarLoaded(false)
    pendingFirstMessageRef.current = null
    alert('연결 오류가 발생했습니다. 다시 시도해주세요.')
  }

  /**
   * WebSocket 연결 종료 핸들러
   * WebSocket 연결이 끊어졌을 때 호출
   * 
   * 연결 종료 처리 프로세스:
   * 1. 녹음 중이면 녹음 중지 및 리소스 정리 (UTTERANCE_END 전송 불가)
   * 2. WebSocket 연결 상태 초기화
   * 3. 세션 상태 초기화
   * 4. TTS 중지
   */
  const handleWebSocketClose = () => {
    // 녹음 중이면 중지 (WebSocket이 끊어졌으므로)
    if (isRecording) {
      // stopRecording()을 호출하면 UTTERANCE_END를 보내려고 하는데
      // WebSocket이 이미 끊어졌으므로 직접 정리만 함
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }
      if (sttTimeoutRef.current) {
        clearTimeout(sttTimeoutRef.current)
        sttTimeoutRef.current = null
      }
      setIsRecording(false)
    }
    setWsConnection(null)
    setIsInitialized(false)
    setIsAvatarLoaded(false)
    pendingFirstMessageRef.current = null
    // TTS도 중지
    stopTTS()
  }

  /**
   * 아바타 로드 완료 핸들러
   * 3D 아바타 모델이 로드 완료되면 호출
   * 아바타 로드 전에 온 첫 질문이 있으면 이 시점에 표시
   */
  const handleAvatarLoad = () => {
    setIsAvatarLoaded(true)
    
    // 대기 중인 첫 질문이 있으면 표시
    if (pendingFirstMessageRef.current) {
      const pendingMessage = pendingFirstMessageRef.current
      pendingFirstMessageRef.current = null
      
      setMessages(prev => [...prev, pendingMessage])
      
      // 타이핑 효과 완료 후 TTS 재생
      const typingDuration = pendingMessage.text.length * 30 + 500
      setTimeout(() => {
        speakText(pendingMessage.text)
      }, typingDuration)
    }
  }

  /**
   * 마이크로 롤플레이 세션 시작
   * 
   * 세션 시작 프로세스:
   * 1. 마이크 권한 확인
   * 2. JWT 토큰 생성
   * 3. 백엔드에 세션 생성 요청
   * 4. WebSocket 연결 및 INIT 메시지 전송
   * 
   * @param {string} title - 시나리오 제목
   * @param {string} body - 시나리오 본문
   * @param {number} scenarioId - 시나리오 ID (기본값: 1)
   */
  const startWithMic = async (title, body, scenarioId = 1) => {
    try {
      // 마이크 권한 확인
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (stream) stream.getTracks().forEach(t => t.stop())

      setSelectedTitle(title)
      setSelectedBody(body)
      setIsSession(true)
      setView('session')
      setMessages([]) // 더미 데이터 제거
      setIsInitialized(false)
      setIsAvatarLoaded(false) // 아바타 로드 상태 리셋
      pendingFirstMessageRef.current = null // 첫 질문 대기 상태 리셋

      // 1. JWT 토큰 생성
      const jwtToken = await getJwtToken(1)

      // 2. 세션 생성
      const sessionData = await startSession(jwtToken, scenarioId)
      setSessionInfo(sessionData)

      // 3. WebSocket 연결 및 INIT 메시지 전송
      const ws = createWebSocketConnection(
        sessionData.ws_url,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketClose,
        // 웹소켓 연결 완료 시 INIT 메시지 전송
        (ws) => {
          const initMessage = {
            type: 'INIT',
            userId: 1,
            subjectId: sessionData.scenario.subject_id,
            myRole: sessionData.scenario.my_role,
            aiRole: sessionData.scenario.ai_role,
            fixedQuestions: sessionData.scenario.fixed_questions
          }
          ws.send(JSON.stringify(initMessage))
        }
      )
      setWsConnection(ws)

    } catch (e) {
      if (e.message.includes('getUserMedia')) {
        alert('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.')
      } else {
        alert(`세션 시작 실패: ${e.message}`)
      }
      setIsSession(false)
      setView('list')
    }
  }

  /**
   * 롤플레이 세션 종료
   * 
   * 세션 종료 프로세스:
   * 1. TTS 중단
   * 2. 녹음 중지 (녹음 중인 경우)
   * 3. WebSocket 연결 종료
   * 4. 상태 초기화
   * 5. 평가 화면 표시 (3초 후 요약 화면으로 전환)
   * 
   * 메시지는 유지하여 피드백 화면에서 대화록 표시 가능
   */
  const endSession = () => {
    // 세션 종료 시 TTS 중단
    stopTTS()
    
    // 녹음 중이면 중지
    if (isRecording) {
      stopRecording()
    }
    
    // WebSocket 연결 종료
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.close()
    }
    setWsConnection(null)
    setIsSession(false)
    // messages는 피드백 화면에서 사용하므로 유지
    setIsInitialized(false)
    setIsAvatarLoaded(false)
    pendingFirstMessageRef.current = null
    setSummary({ time: '10분', turns: 10, suggestions: 3 })
    setEvaluating(true)
    setTimeout(() => {
      setEvaluating(false)
      // 현재 세션의 제목과 본문으로 피드백 화면으로 이동
      handleFeedbackView(selectedTitle, selectedBody)
    }, 3000)
  }

  /**
   * 피드백 뷰로 전환 핸들러
   * 세션 종료 후 피드백 화면으로 이동할 때 사용
   * 
   * @param {string} title - 시나리오 제목
   * @param {string} body - 시나리오 본문
   */
  const handleFeedbackView = (title, body) => {
    setSelectedTitle(title)
    setSelectedBody(body)
    setIsSession(false)
    setEvaluating(false)
    setView('summary')
    setSummaryTab('summary')
  }

  /**
   * 키보드 모드 토글 핸들러
   * 마이크 모드와 키보드 입력 모드를 전환
   * 모드 전환 시 텍스트 입력값 초기화
   */
  const toggleKeyboardMode = () => {
    setIsKeyboardMode(prev => !prev)
    setTextInput('')
  }

  /**
   * 텍스트 입력 변경 핸들러
   * 키보드 모드에서 사용자가 입력한 텍스트를 상태에 저장
   * 
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleTextInputChange = (e) => {
    setTextInput(e.target.value)
  }

  /**
   * 오디오 녹음 시작 함수
   * 
   * 녹음 시작 프로세스:
   * 1. 마이크 권한 요청 및 오디오 스트림 획득
   * 2. AudioContext 초기화 (16kHz, Mono)
   * 3. ScriptProcessorNode로 PCM 데이터 추출
   * 4. Float32 → Int16 변환
   * 5. WebSocket으로 실시간 전송
   * 
   * WebSocket 연결 상태와 세션 초기화 상태를 확인한 후에만 녹음 시작
   */
  const startRecording = async () => {
    // 이미 녹음 중이면 무시
    if (isRecording) {
      return
    }
    
    // ref 업데이트
    isRecordingRef.current = true

    // WebSocket 연결 상태 확인
    if (!wsConnection) {
      alert('WebSocket 연결이 없습니다.')
      return
    }

    if (wsConnection.readyState !== WebSocket.OPEN) {
      alert('WebSocket이 연결되지 않았습니다. 연결 상태를 확인해주세요.')
      return
    }

    if (!isInitialized) {
      alert('세션이 아직 초기화되지 않았습니다. 잠시만 기다려주세요.')
      return
    }

    try {
      // 마이크 권한 요청 및 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // mono
          sampleRate: 16000, // 16kHz
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      audioStreamRef.current = stream
      sttPartialTextRef.current = ''

      // MediaRecorder 설정
      const options = {
        mimeType: 'audio/webm;codecs=opus', // 브라우저 호환성을 위해 webm 사용
        audioBitsPerSecond: 16000
      }

      // 브라우저가 지원하는 오디오 포맷 확인
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        delete options.mimeType
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      // AudioContext를 사용하여 직접 PCM 데이터 추출 (MediaRecorder 대신)
      let audioContext = null
      let scriptProcessor = null
      let sourceNode = null
      let chunkCount = 0
      let isFirstChunk = true
      
      try {
        // AudioContext 초기화 (16kHz 샘플레이트)
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        })
        
        // MediaStream을 AudioContext에 연결
        sourceNode = audioContext.createMediaStreamSource(stream)
        
        // ScriptProcessorNode를 사용하여 PCM 데이터 추출
        // (AudioWorklet이 더 권장되지만 호환성을 위해 ScriptProcessor 사용)
        const bufferSize = 4096 // 버퍼 크기
        scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)
        
        // PCM 데이터 처리
        scriptProcessor.onaudioprocess = (event) => {
          // WebSocket 연결 상태 확인
          const currentWs = wsConnection
          if (!currentWs || currentWs.readyState !== WebSocket.OPEN || !isInitialized) {
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
          
          chunkCount++
          
          // 첫 번째 청크는 지연
          if (isFirstChunk) {
            isFirstChunk = false
            setTimeout(() => {
              if (currentWs && currentWs.readyState === WebSocket.OPEN && isInitialized) {
                currentWs.send(pcmData.buffer)
              }
            }, 200)
          } else {
            // 이후 청크는 즉시 전송
            if (currentWs && currentWs.readyState === WebSocket.OPEN && isInitialized) {
              currentWs.send(pcmData.buffer)
            }
          }
        }
        
        // 연결: source → scriptProcessor → destination (무음)
        sourceNode.connect(scriptProcessor)
        scriptProcessor.connect(audioContext.destination)
      } catch (e) {
        alert('오디오 처리를 초기화할 수 없습니다. 브라우저를 업데이트하거나 다른 브라우저를 사용해주세요.')
        stream.getTracks().forEach(track => track.stop())
        return
      }

      // MediaRecorder는 백업용으로만 유지 (실제로는 사용하지 않음)
      // 하지만 MediaRecorder가 없으면 일부 브라우저에서 문제가 발생할 수 있으므로 유지
      mediaRecorder.ondataavailable = () => {
        // AudioContext를 사용하므로 여기서는 아무것도 하지 않음
      }

      mediaRecorder.onerror = () => {
        // AudioContext를 사용하므로 MediaRecorder 에러는 무시
      }

      mediaRecorder.onstop = () => {
        // AudioContext 정리
        if (scriptProcessor) {
          scriptProcessor.disconnect()
          scriptProcessor = null
        }
        if (sourceNode) {
          sourceNode.disconnect()
          sourceNode = null
        }
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close().catch(() => {})
          audioContext = null
        }
      }

      // WebSocket 상태를 다시 확인한 후 녹음 시작
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN && isInitialized) {
        // STT 부분 결과 초기화
        sttPartialTextRef.current = ''
        // STT 타임아웃 설정 (5초 동안 부분 결과가 없으면 경고)
        if (sttTimeoutRef.current) {
          clearTimeout(sttTimeoutRef.current)
        }
        sttTimeoutRef.current = setTimeout(() => {
          // STT 서비스가 작동하지 않을 수 있음
        }, 5000)
        // 100ms마다 데이터 수집 (백엔드 요구사항: 약 64ms @ 16kHz, 1024 bytes)
        mediaRecorder.start(100) // 100ms 간격으로 데이터 수집
      setIsRecording(true)
      isRecordingRef.current = true
      } else {
        if (!isInitialized) {
          alert('세션이 아직 초기화되지 않았습니다. 잠시만 기다려주세요.')
        } else {
          alert('WebSocket 연결이 없습니다. 녹음을 시작할 수 없습니다.')
        }
        stream.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }

    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.')
      } else {
        alert(`녹음 시작 실패: ${error.message}`)
      }
      setIsRecording(false)
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }
    }
  }

  /**
   * 오디오 녹음 종료 함수
   * 
   * 녹음 종료 프로세스:
   * 1. MediaRecorder 정지
   * 2. 오디오 스트림 정리
   * 3. STT 타임아웃 정리
   * 4. WebSocket으로 UTTERANCE_END 메시지 전송
   * 
   * UTTERANCE_END 메시지는 서버에 발화가 끝났음을 알려 STT 최종 결과를 받기 위함
   */
  const stopRecording = () => {
    // ref 업데이트
    isRecordingRef.current = false
    
    // MediaRecorder 정지
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // 오디오 스트림 정리
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    // STT 타임아웃 정리
    if (sttTimeoutRef.current) {
      clearTimeout(sttTimeoutRef.current)
      sttTimeoutRef.current = null
    }

    setIsRecording(false)

    // UTTERANCE_END 메시지 전송 (WebSocket이 열려있을 때만)
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      try {
        const utteranceEndMessage = {
          type: 'UTTERANCE_END'
        }
        wsConnection.send(JSON.stringify(utteranceEndMessage))
      } catch (error) {
        // UTTERANCE_END 메시지 전송 실패 무시
      }
    }
  }

  /**
   * 마이크 버튼 토글 핸들러
   * 녹음 중이면 중지, 녹음 중이 아니면 시작
   */
  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  /**
   * 텍스트 메시지 전송 함수
   * 키보드 모드에서 사용자가 입력한 텍스트를 WebSocket으로 전송
   * 
   * 전송 프로세스:
   * 1. 입력값 유효성 검증 (빈 문자열, WebSocket 연결 상태 확인)
   * 2. 현재 재생 중인 TTS 중단
   * 3. 사용자 메시지를 UI에 추가
   * 4. WebSocket으로 USER_TEXT 메시지 전송
   */
  const sendMessage = () => {
    if (!textInput.trim() || !wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      return
    }

    if (!isInitialized) {
      alert('세션이 아직 초기화되지 않았습니다. 잠시만 기다려주세요.')
      return
    }

    const userText = textInput.trim()

    // ✅ 사용자 메시지 전송 시 이전 TTS 중단
    stopTTS()

    // 사용자 메시지 UI에 추가
    setMessages(prev => [...prev, {
      who: 'You',
      text: userText
    }])
    setTextInput('')

    // WebSocket으로 USER_TEXT 메시지 전송
    const userMessage = {
      type: 'USER_TEXT',
      text: userText
    }
    wsConnection.send(JSON.stringify(userMessage))
  }

  /**
   * 컴포넌트 언마운트 시 정리 (Cleanup)
   * 
   * 컴포넌트가 언마운트될 때 모든 리소스를 정리:
   * 1. TTS 중단
   * 2. 녹음 중지 및 오디오 스트림 정리
   * 3. WebSocket 연결 종료 (END_SESSION 메시지 전송 후)
   * 4. 모든 타임아웃 정리
   * 
   * isRecordingRef를 사용하여 최신 녹음 상태를 확인 (클로저 문제 방지)
   */
  useEffect(() => {
    return () => {
      // TTS 중단
      stopTTS()
      
      // 녹음 중지 (ref로 확인하여 최신 상태 사용)
      if (isRecordingRef.current) {
        // ref를 false로 설정하여 stopRecording 내부에서 중복 처리 방지
        isRecordingRef.current = false
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
        
        // 오디오 스트림 정리
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop())
          audioStreamRef.current = null
        }
        
        // STT 타임아웃 정리
        if (sttTimeoutRef.current) {
          clearTimeout(sttTimeoutRef.current)
          sttTimeoutRef.current = null
        }
      }
      
      // WebSocket 종료 (명시적으로 END_SESSION 메시지 전송 후 종료)
      const currentWs = wsConnection
      if (currentWs) {
        const currentState = currentWs.readyState
        
        // 녹음 중이 아니고 정상적으로 세션이 종료되는 경우에만 END_SESSION 전송
        if (!isRecordingRef.current && currentState === WebSocket.OPEN) {
          try {
            const endSessionMessage = {
              type: 'END_SESSION'
            }
            currentWs.send(JSON.stringify(endSessionMessage))
            // 메시지 전송 후 잠시 대기 후 종료
            setTimeout(() => {
              if (currentWs.readyState === WebSocket.OPEN) {
                currentWs.close()
              }
            }, 100)
          } catch (error) {
            currentWs.close()
          }
        } else if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
          currentWs.close()
        }
      }
      
      // 타임아웃 정리
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current)
      }
      if (aiTypingTimeoutRef.current) {
        clearTimeout(aiTypingTimeoutRef.current)
      }
      if (sttTimeoutRef.current) {
        clearTimeout(sttTimeoutRef.current)
      }
    }
  }, []) // 빈 의존성 배열: 실제 컴포넌트 언마운트 시에만 실행

  /**
   * 훅 반환값
   * 컴포넌트에서 사용할 수 있는 모든 상태와 핸들러를 반환
   */
  return {
    // 세션 상태
    isSession, // 세션 활성화 여부
    messages, // 대화 메시지 목록
    selectedTitle, // 선택된 시나리오 제목
    selectedBody, // 선택된 시나리오 본문
    view, // 현재 뷰 상태 ('list' | 'session' | 'summary')
    setView, // 뷰 상태 변경 핸들러
    summaryTab, // 요약 탭 상태 ('summary' | 'transcript')
    setSummaryTab, // 요약 탭 상태 변경 핸들러
    evaluating, // 평가 중 여부
    summary, // 세션 요약 정보
    bottomRef, // 메시지 리스트 하단 스크롤용 ref
    
    // 입력 모드 상태
    isKeyboardMode, // 키보드 입력 모드 여부
    textInput, // 텍스트 입력값
    isRecording, // 녹음 중 여부
    setIsRecording, // 녹음 상태 변경 핸들러
    
    // 세션 제어 핸들러
    startWithMic, // 마이크로 세션 시작 핸들러
    endSession, // 세션 종료 핸들러
    handleFeedbackView, // 피드백 뷰로 전환 핸들러
    
    // 입력 핸들러
    toggleKeyboardMode, // 키보드 모드 토글 핸들러
    handleTextInputChange, // 텍스트 입력 변경 핸들러
    sendMessage, // 텍스트 메시지 전송 핸들러
    handleMicToggle, // 마이크 버튼 토글 핸들러
    
    // TTS 및 아바타 상태
    isTTSPlaying, // TTS 재생 상태
    isAvatarLoaded, // 아바타 로드 상태
    handleAvatarLoad // 아바타 로드 완료 핸들러
  }
}



