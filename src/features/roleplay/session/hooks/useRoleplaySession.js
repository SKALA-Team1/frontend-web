import { useState, useMemo, useRef, useEffect } from 'react'
import { startSession, createWebSocketConnection, getSessionUtterances } from '../../../../services/roleplayService'
import { getUserIdFromToken } from '../../../../utils/jwt'

// ========================================
// 상수 정의
// ========================================
const TYPING_SPEED_MS_PER_CHAR = 30
const TYPING_DELAY_MS = 500
const TTS_CHAR_DURATION_MS = 60
const TTS_MIN_DURATION_MS = 1500
const TTS_LEAD_TIME_MS = 1000
const LIP_SYNC_DELAY_MS = 500
const AVATAR_LOAD_TIMEOUT_MS = 2500
const STREAMING_COMPLETE_TIMEOUT_MS = 1000
const AI_TYPING_TIMEOUT_MS = 35000
const STT_TIMEOUT_MS = 5000
const FIRST_CHUNK_DELAY_MS = 200
const EVALUATION_DELAY_MS = 3000
const WEBSOCKET_CLOSE_DELAY_MS = 100

const AUDIO_CONFIG = {
  channelCount: 1,
  sampleRate: 16000,
  echoCancellation: true,
  noiseSuppression: true
}

const TTS_CONFIG = {
  lang: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
}

const FALLBACK_MESSAGE = "I'm having trouble generating a response. Could you please rephrase your question?"

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
 *   - isKeyboardMode: boolean - 키보드 입력 모드 여부
 *   - textInput: string - 텍스트 입력값
 *   - isRecording: boolean - 녹음 중 여부
 *   - isTTSPlaying: boolean - TTS 재생 중 여부
 *   - isAvatarLoaded: boolean - 아바타 로드 완료 여부
 *   - bottomRef: Ref - 메시지 리스트 하단 스크롤용 ref
 *   - startWithMic: Function - 마이크로 세션 시작 핸들러
 *   - endSession: Function - 세션 종료 핸들러
 *   - handleMicToggle: Function - 마이크 토글 핸들러
 *   - sendMessage: Function - 텍스트 메시지 전송 핸들러
 *   - toggleKeyboardMode: Function - 키보드 모드 토글 핸들러
 *   - handleTextInputChange: Function - 텍스트 입력 변경 핸들러
 *   - handleFeedbackView: Function - 피드백 뷰로 전환 핸들러
 *   - handleAvatarLoad: Function - 아바타 로드 완료 핸들러
 */
export default function useRoleplaySession() {
  // ========================================
  // State 정의
  // ========================================
  const [isSession, setIsSession] = useState(false)
  const [messages, setMessages] = useState([])
  const [selectedTitle, setSelectedTitle] = useState('')
  const [selectedBody, setSelectedBody] = useState('')
  const [view, setView] = useState('list')
  const [summaryTab, setSummaryTab] = useState('summary')
  const [evaluating, setEvaluating] = useState(false)
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [wsConnection, setWsConnection] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTTSPlaying, setIsTTSPlaying] = useState(false)
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false)
  const visemeQueue = useRef([]) // 성능 최적화: 리렌더링 없이 데이터 관리

  // ========================================
  // Ref 정의
  // ========================================
  const pendingFirstMessageRef = useRef(null)
  const pendingFirstMessageTimeoutRef = useRef(null)
  const bottomRef = useRef(null)
  const streamingTimeoutRef = useRef(null)
  const aiTypingTimeoutRef = useRef(null)
  const currentUtteranceRef = useRef(null)
  const audioRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioStreamRef = useRef(null)
  const sttPartialTextRef = useRef('')
  const sttTimeoutRef = useRef(null)
  const needsCorrectionRef = useRef(false)
  const pendingFeedbackSectionsRef = useRef([])
  const isRecordingRef = useRef(false)
  const lipSyncDelayTimeoutRef = useRef(null)
  const lipSyncEndTimeoutRef = useRef(null)

  // ========================================
  // 유틸리티 함수
  // ========================================

  /**
   * 번역 텍스트 추출
   * 메시지에서 한국어 번역 텍스트를 찾아 반환
   */
  const extractTranslation = (message) => {
    return message.question_ko || message.text_ko || message.feedback_ko || message.korean_question || message.translation
  }

  /**
   * 피드백 텍스트 파싱
   * JSON 문자열인 경우 파싱하여 feedback 필드 추출
   */
  const parseFeedbackText = (feedbackEn) => {
    if (!feedbackEn) return ''
    try {
      const parsed = JSON.parse(feedbackEn)
      return parsed.feedback || feedbackEn
    } catch (e) {
      return feedbackEn
    }
  }

  /**
   * 피드백 섹션 필터링 및 정렬
   * grammar와 relevance만 필터링하고 grammar를 먼저 정렬
   */
  const filterAndSortFeedbackSections = (sections) => {
    return sections
      .filter(section => section.type === 'grammar' || section.type === 'relevance')
      .sort((a, b) => {
        if (a.type === 'grammar' && b.type === 'relevance') return -1
        if (a.type === 'relevance' && b.type === 'grammar') return 1
        return 0
      })
  }

  /**
   * AI 메시지 추가
   * 타이핑 효과 후 TTS 재생까지 처리
   */
  const addAIMessage = (text, translation, isFixedQuestion = false, isStreaming = false) => {
    setMessages(prev => [...prev, {
      who: 'AI',
      text,
      translation,
      isFixedQuestion,
      isStreaming
    }])

    if (!isStreaming) {
      const typingDuration = text.length * TYPING_SPEED_MS_PER_CHAR + TYPING_DELAY_MS
      setTimeout(() => {
        speakText(text)
      }, typingDuration)
    }
  }

  /**
   * 타임아웃 정리 헬퍼
   */
  const clearTimeoutRef = (timeoutRef) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  /**
   * 녹음 리소스 정리
   */
  const cleanupRecordingResources = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }
    clearTimeoutRef(sttTimeoutRef)
    setIsRecording(false)
    isRecordingRef.current = false
  }

  // ========================================
  // TTS 관련 함수
  // ========================================

  /**
   * 아바타 입모양 지연 타임아웃 정리
   */
  const clearLipSyncDelay = () => {
    clearTimeoutRef(lipSyncDelayTimeoutRef)
  }

  /**
   * 아바타 입모양 종료 타임아웃 정리
   */
  const clearLipSyncEnd = () => {
    clearTimeoutRef(lipSyncEndTimeoutRef)
  }

  /**
   * 아바타 입모양 종료 스케줄링
   */
  const scheduleLipSyncEnd = (text = '') => {
    clearLipSyncEnd()
    const estimatedDuration = Math.max(TTS_MIN_DURATION_MS, text.length * TTS_CHAR_DURATION_MS)
    const delay = Math.max(0, estimatedDuration - TTS_LEAD_TIME_MS)
    lipSyncEndTimeoutRef.current = setTimeout(() => {
      setIsTTSPlaying(false)
      lipSyncEndTimeoutRef.current = null
    }, delay)
  }

  /**
   * TTS (Text-to-Speech) 함수
   * ElevenLabs TTS로 대체되었으므로 비활성화
   * WebSocket을 통해 TTS_AUDIO 메시지로 처리됨
   */
  const speakText = (text) => {
    // Web Speech API 비활성화 - ElevenLabs TTS 사용
    return
  }

  /**
   * TTS 중단
   */
  const stopTTS = () => {
    // Web Speech API 중단
    if (currentUtteranceRef.current) {
      window.speechSynthesis.cancel()
      currentUtteranceRef.current = null
    }
    // ElevenLabs TTS 오디오 중단
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    clearLipSyncDelay()
    clearLipSyncEnd()
    setIsTTSPlaying(false)
    visemeQueue.current = [] // Viseme 큐 초기화
  }

  /**
   * TTS 오디오 재생 (ElevenLabs)
   */
  const handleTTSAudio = (audioBase64) => {
    try {
      // 이전 오디오 중지 및 정리
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      visemeQueue.current = [] // Viseme 큐 초기화
      setIsTTSPlaying(false)

      // Base64 디코딩
      const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      const blob = new Blob([audioData], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      
      // 오디오 재생
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onplay = () => {
        setIsTTSPlaying(true)
      }
      
      audio.onended = () => {
        setIsTTSPlaying(false)
        URL.revokeObjectURL(audioUrl)
        visemeQueue.current = [] // Viseme 큐 초기화
        audioRef.current = null
      }
      
      audio.onerror = (error) => {
        console.error('[TTS] 오디오 재생 실패:', error)
        setIsTTSPlaying(false)
        URL.revokeObjectURL(audioUrl)
        visemeQueue.current = []
        audioRef.current = null
      }
      
      audio.play().catch(error => {
        console.error('[TTS] 오디오 재생 시작 실패:', error)
        setIsTTSPlaying(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      })
    } catch (error) {
      console.error('[TTS] 오디오 처리 실패:', error)
      setIsTTSPlaying(false)
      visemeQueue.current = []
    }
  }

  /**
   * TTS Viseme 데이터 수신 (ElevenLabs)
   * 성능 최적화: useRef 사용으로 리렌더링 없이 데이터 관리
   */
  const handleTTSViseme = (visemeData) => {
    visemeQueue.current.push({
      startTime: visemeData.start_time,
      endTime: visemeData.end_time,
      value: visemeData.value
    })
  }

  // ========================================
  // 피드백 처리 함수
  // ========================================

  /**
   * 피드백 메시지 표시
   */
  const displayFeedbackMessages = (sections) => {
    const feedbackToShow = filterAndSortFeedbackSections(sections)
    
    feedbackToShow.forEach((section) => {
      const translationText = section.feedback_ko
      const feedbackText = parseFeedbackText(section.feedback_en)
      
      addAIMessage(feedbackText, translationText, false, false)
    })
  }

  /**
   * 피드백 섹션 저장
   */
  const storeFeedbackSections = (sections) => {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return
    }

    sections.forEach(section => {
      const exists = pendingFeedbackSectionsRef.current.some(
        s => s.type === section.type && s.feedback_en === section.feedback_en
      )
      if (!exists && section.feedback_en) {
        pendingFeedbackSectionsRef.current.push(section)
      }
    })
  }

  // ========================================
  // WebSocket 메시지 핸들러 (각 타입별)
  // ========================================

  /**
   * ACK 메시지 처리
   */
  const handleACK = (message) => {
    if (message.message === 'Session initialized') {
      setIsInitialized(true)
    }
  }

  /**
   * AI_TEXT 메시지 처리
   */
  const handleAIText = (message) => {
    const translationText = extractTranslation(message)
    
    if (!isAvatarLoaded && messages.length === 0) {
      pendingFirstMessageRef.current = {
        who: 'AI',
        text: message.text,
        translation: translationText,
        isFixedQuestion: message.is_fixed_question || false,
        isStreaming: false
      }
      
      clearTimeoutRef(pendingFirstMessageTimeoutRef)
      pendingFirstMessageTimeoutRef.current = setTimeout(() => {
        if (pendingFirstMessageRef.current) {
          const pendingMessage = pendingFirstMessageRef.current
          pendingFirstMessageRef.current = null
          setMessages(prev => [...prev, pendingMessage])
          const typingDuration = pendingMessage.text.length * TYPING_SPEED_MS_PER_CHAR + TYPING_DELAY_MS
          setTimeout(() => {
            speakText(pendingMessage.text)
          }, typingDuration)
        }
      }, AVATAR_LOAD_TIMEOUT_MS)
      return
    }
    
    addAIMessage(message.text, translationText, message.is_fixed_question || false, false)
  }

  /**
   * AI_TEXT_STREAMING 메시지 처리
   */
  const handleAIStreaming = (message) => {
    const streamingTranslation = extractTranslation(message)
    
    clearTimeoutRef(aiTypingTimeoutRef)
    clearTimeoutRef(streamingTimeoutRef)
    
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1]
      
      if (lastMessage && lastMessage.who === 'AI' && lastMessage.isStreaming) {
        const newText = lastMessage.text + message.chunk
        if (newText === lastMessage.text) {
          return prev
        }
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            text: newText,
            translation: streamingTranslation || lastMessage.translation,
            isStreaming: true
          }
        ]
      } else {
        return [
          ...prev,
          {
            who: 'AI',
            text: message.chunk,
            translation: streamingTranslation,
            isFixedQuestion: message.is_fixed_question || false,
            isStreaming: true
          }
        ]
      }
    })
    
    streamingTimeoutRef.current = setTimeout(async () => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage && lastMessage.who === 'AI' && lastMessage.isStreaming) {
          const completedMessage = {
            ...lastMessage,
            isStreaming: false
          }
          speakText(completedMessage.text)
          return [
            ...prev.slice(0, -1),
            completedMessage
          ]
        }
        return prev
      })
      streamingTimeoutRef.current = null
    }, STREAMING_COMPLETE_TIMEOUT_MS)
  }

  /**
   * AI_TEXT_KOREAN 메시지 처리 (한글 번역)
   */
  const handleAIKorean = (message) => {
    const translationText = message.text_ko || message.question_ko
    
    if (translationText) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        // 마지막 메시지가 AI 메시지인 경우 번역 추가/업데이트
        if (lastMessage && lastMessage.who === 'AI') {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              translation: translationText
            }
          ]
        }
        return prev
      })
    }
  }

  /**
   * AI_TYPING 메시지 처리
   */
  const handleAITyping = () => {
    clearTimeoutRef(aiTypingTimeoutRef)
    
    aiTypingTimeoutRef.current = setTimeout(() => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (!lastMessage || lastMessage.who !== 'AI' || !lastMessage.isStreaming) {
          return [
            ...prev,
            {
              who: 'AI',
              text: FALLBACK_MESSAGE,
              isFixedQuestion: false,
              isStreaming: false
            }
          ]
        }
        return prev
      })
      aiTypingTimeoutRef.current = null
    }, AI_TYPING_TIMEOUT_MS)
  }

  /**
   * STT_PARTIAL 메시지 처리
   */
  const handleSTTPartial = (message) => {
    clearTimeoutRef(sttTimeoutRef)
    
    if (message.text) {
      sttPartialTextRef.current = message.text
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
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
  }

  /**
   * STT_FINAL 메시지 처리
   */
  const handleSTTFinal = (message) => {
    clearTimeoutRef(sttTimeoutRef)
    sttPartialTextRef.current = ''
    
    if (message.text && message.text.trim()) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
          // STT_PARTIAL로 생성된 임시 메시지를 최종 텍스트로 업데이트
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              text: message.text,
              isSTT: false
            }
          ]
        } else {
          // STT_PARTIAL이 없었던 경우 새로 메시지 추가
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
      // 빈 텍스트인 경우 STT_PARTIAL 메시지 제거
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
          return prev.slice(0, -1)
        }
        return prev
      })
    }
  }

  /**
   * SESSION_ENDED 메시지 처리
   */
  const handleSessionEnded = () => {
    if (pendingFeedbackSectionsRef.current.length > 0) {
      displayFeedbackMessages(pendingFeedbackSectionsRef.current)
      pendingFeedbackSectionsRef.current = []
    }
    endSession('auto')
  }

  /**
   * RETRY_REQUIRED 메시지 처리
   */
  const handleRetryRequired = () => {
    needsCorrectionRef.current = true
    
    if (pendingFeedbackSectionsRef.current.length > 0) {
      displayFeedbackMessages(pendingFeedbackSectionsRef.current)
      pendingFeedbackSectionsRef.current = []
      needsCorrectionRef.current = false
    }
  }

  /**
   * FEEDBACK_SECTIONS 메시지 처리
   */
  const handleFeedbackSections = (message) => {
    storeFeedbackSections(message.sections)
    
    if (needsCorrectionRef.current) {
      const feedbackToShow = filterAndSortFeedbackSections(pendingFeedbackSectionsRef.current)
      
      feedbackToShow.forEach((section) => {
        const translationText = section.feedback_ko
        const feedbackText = parseFeedbackText(section.feedback_en)
        addAIMessage(feedbackText, translationText, false, false)
      })
      
      pendingFeedbackSectionsRef.current = pendingFeedbackSectionsRef.current.filter(
        section => section.type !== 'grammar' && section.type !== 'relevance'
      )
      needsCorrectionRef.current = false
    }
  }

  /**
   * FEEDBACK_STREAMING 메시지 처리
   */
  const handleFeedbackStreaming = (message) => {
    if (!needsCorrectionRef.current || !message.chunk) {
      return
    }
    
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage && lastMessage.who === 'AI' && lastMessage.isFeedbackStreaming) {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            text: lastMessage.text + message.chunk,
            isStreaming: true,
            isFeedbackStreaming: true
          }
        ]
      } else {
        return [
          ...prev,
          {
            who: 'AI',
            text: message.chunk,
            isFixedQuestion: false,
            isStreaming: true,
            isFeedbackStreaming: true
          }
        ]
      }
    })
  }

  /**
   * ERROR 메시지 처리
   */
  const handleError = (message) => {
    if (message.code === 'SILENCE_DETECTED') {
      console.info('음성이 감지되지 않았습니다. 다시 말씀해주세요.')
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage && lastMessage.who === 'You' && lastMessage.isSTT) {
          return prev.slice(0, -1)
        }
        return prev
      })
      sttPartialTextRef.current = ''
    } else if (message.code === 'SESSION_NOT_INITIALIZED') {
      alert('세션 초기화 오류가 발생했습니다. 페이지를 새로고침해주세요.')
      if (isRecording) {
        stopRecording()
      }
    } else {
      alert(`오류: ${message.message}`)
      if (isRecording) {
        stopRecording()
      }
    }
    stopTTS()
  }

  /**
   * WebSocket 메시지 처리 메인 함수
   */
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'ACK':
        handleACK(message)
        break
      case 'AI_TEXT':
        handleAIText(message)
        break
      case 'AI_TEXT_STREAMING':
        handleAIStreaming(message)
        break
      case 'AI_TEXT_KOREAN':
        handleAIKorean(message)
        break
      case 'AI_TYPING':
        handleAITyping()
        break
      case 'STT_PARTIAL':
        handleSTTPartial(message)
        break
      case 'STT_FINAL':
        handleSTTFinal(message)
        break
      case 'UTTERANCE_SAVED':
        break
      case 'SESSION_ENDED':
        handleSessionEnded()
        break
      case 'FEEDBACK':
        break
      case 'RETRY_REQUIRED':
        handleRetryRequired()
        break
      case 'FEEDBACK_SECTIONS':
        handleFeedbackSections(message)
        break
      case 'FEEDBACK_STREAMING':
        handleFeedbackStreaming(message)
        break
      case 'TTS_AUDIO':
        handleTTSAudio(message.audio_base64)
        break
      case 'TTS_VISEME':
        handleTTSViseme({
          start_time: message.start_time,
          end_time: message.end_time,
          value: message.value
        })
        break
      case 'ERROR':
        handleError(message)
        break
      default:
        break
    }
  }

  // ========================================
  // WebSocket 에러/종료 핸들러
  // ========================================

  /**
   * WebSocket 에러 핸들러
   */
  const handleWebSocketError = (error) => {
    if (isRecording) {
      cleanupRecordingResources()
    }
    setIsInitialized(false)
    setIsAvatarLoaded(false)
    pendingFirstMessageRef.current = null
    alert('연결 오류가 발생했습니다. 다시 시도해주세요.')
  }

  /**
   * WebSocket 연결 종료 핸들러
   */
  const handleWebSocketClose = () => {
    if (isRecording) {
      cleanupRecordingResources()
    }
    setWsConnection(null)
    setIsInitialized(false)
    setIsAvatarLoaded(false)
    pendingFirstMessageRef.current = null
    stopTTS()
  }

  // ========================================
  // 세션 관리 함수
  // ========================================

  /**
   * 아바타 로드 완료 핸들러
   */
  const handleAvatarLoad = () => {
    setIsAvatarLoaded(true)
    clearTimeoutRef(pendingFirstMessageTimeoutRef)
    
    if (pendingFirstMessageRef.current) {
      const pendingMessage = pendingFirstMessageRef.current
      pendingFirstMessageRef.current = null
      
      setMessages(prev => [...prev, pendingMessage])
      
      const typingDuration = pendingMessage.text.length * TYPING_SPEED_MS_PER_CHAR + TYPING_DELAY_MS
      setTimeout(() => {
        speakText(pendingMessage.text)
      }, typingDuration)
    }
  }

  /**
   * 마이크로 롤플레이 세션 시작
   */
  const startWithMic = async (title, body, scenarioId = 1) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (stream) stream.getTracks().forEach(t => t.stop())

      setSelectedTitle(title)
      setSelectedBody(body)
      setIsSession(true)
      setView('session')
      setMessages([])
      setIsInitialized(false)
      setIsAvatarLoaded(false)
      pendingFirstMessageRef.current = null

      const sessionData = await startSession(scenarioId)
      setSessionInfo(sessionData)

      const ws = createWebSocketConnection(
        sessionData.ws_url,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketClose,
        (ws) => {
          const userId = getUserIdFromToken()
          if (!userId) {
            console.error('[useRoleplaySession] userId를 추출할 수 없습니다.')
            return
          }
          
          const initMessage = {
            type: 'INIT',
            userId: userId,
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
   */
  const endSession = (reason = 'user') => {
    stopTTS()
    
    if (isRecording) {
      stopRecording()
    }
    
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.close()
    }
    setWsConnection(null)
    setIsSession(false)
    setIsInitialized(false)
    setIsAvatarLoaded(false)
    pendingFirstMessageRef.current = null
    setEvaluating(false)
    setView(reason === 'auto' ? 'summary' : 'list')
  }

  /**
   * 피드백 뷰로 전환 핸들러
   */
  const handleFeedbackView = (title, body) => {
    setSelectedTitle(title)
    setSelectedBody(body)
    setIsSession(false)
    setEvaluating(false)
    setView('summary')
    setSummaryTab('summary')
  }

  // ========================================
  // 입력 모드 관련 함수
  // ========================================

  /**
   * 키보드 모드 토글
   */
  const toggleKeyboardMode = () => {
    setIsKeyboardMode(prev => !prev)
    setTextInput('')
  }

  /**
   * 텍스트 입력 변경 핸들러
   */
  const handleTextInputChange = (e) => {
    setTextInput(e.target.value)
  }

  /**
   * 텍스트 메시지 전송
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
    stopTTS()

    setMessages(prev => [...prev, {
      who: 'You',
      text: userText
    }])
    
    setTextInput('')

    const userMessage = {
      type: 'USER_TEXT',
      text: userText
    }
    wsConnection.send(JSON.stringify(userMessage))
  }

  // ========================================
  // 오디오 녹음 관련 함수
  // ========================================

  /**
   * 오디오 녹음 시작
   */
  const startRecording = async () => {
    if (isRecording) {
      return
    }
    
    isRecordingRef.current = true

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: AUDIO_CONFIG
      })
      
      audioStreamRef.current = stream
      sttPartialTextRef.current = ''

      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      }

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        delete options.mimeType
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      let audioContext = null
      let scriptProcessor = null
      let sourceNode = null
      let isFirstChunk = true
      
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: AUDIO_CONFIG.sampleRate
        })
        
        sourceNode = audioContext.createMediaStreamSource(stream)
        const bufferSize = 4096
        scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)
        
        scriptProcessor.onaudioprocess = (event) => {
          const currentWs = wsConnection
          if (!currentWs || currentWs.readyState !== WebSocket.OPEN || !isInitialized) {
            return
          }
          
          const inputBuffer = event.inputBuffer
          const channelData = inputBuffer.getChannelData(0)
          
          const pcmData = new Int16Array(channelData.length)
          for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]))
            pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
          }
          
          if (isFirstChunk) {
            isFirstChunk = false
            setTimeout(() => {
              if (currentWs && currentWs.readyState === WebSocket.OPEN && isInitialized) {
                currentWs.send(pcmData.buffer)
              }
            }, FIRST_CHUNK_DELAY_MS)
          } else {
            if (currentWs && currentWs.readyState === WebSocket.OPEN && isInitialized) {
              currentWs.send(pcmData.buffer)
            }
          }
        }
        
        sourceNode.connect(scriptProcessor)
        scriptProcessor.connect(audioContext.destination)
      } catch (e) {
        alert('오디오 처리를 초기화할 수 없습니다. 브라우저를 업데이트하거나 다른 브라우저를 사용해주세요.')
        stream.getTracks().forEach(track => track.stop())
        return
      }

      mediaRecorder.ondataavailable = () => {}
      mediaRecorder.onerror = () => {}

      mediaRecorder.onstop = () => {
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

      if (wsConnection && wsConnection.readyState === WebSocket.OPEN && isInitialized) {
        sttPartialTextRef.current = ''
        if (sttTimeoutRef.current) {
          clearTimeout(sttTimeoutRef.current)
        }
        sttTimeoutRef.current = setTimeout(() => {
          // STT 서비스가 작동하지 않을 수 있음
        }, STT_TIMEOUT_MS)
        mediaRecorder.start(100)
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
   * 오디오 녹음 종료
   */
  const stopRecording = () => {
    isRecordingRef.current = false
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    clearTimeoutRef(sttTimeoutRef)
    setIsRecording(false)

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
   * 마이크 버튼 토글
   */
  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // ========================================
  // Effect Hooks
  // ========================================

  /**
   * 메시지 리스트 자동 스크롤
   */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isSession])

  /**
   * 음성 목록 로드
   */
  useEffect(() => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          // 음성 목록 로드 완료
        }
      }
    }
  }, [])

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      stopTTS()
      
      if (isRecordingRef.current) {
        isRecordingRef.current = false
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
        
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop())
          audioStreamRef.current = null
        }
        
        clearTimeoutRef(sttTimeoutRef)
      }
      
      const currentWs = wsConnection
      if (currentWs) {
        const currentState = currentWs.readyState
        
        if (!isRecordingRef.current && currentState === WebSocket.OPEN) {
          try {
            const endSessionMessage = {
              type: 'END_SESSION'
            }
            currentWs.send(JSON.stringify(endSessionMessage))
            setTimeout(() => {
              if (currentWs.readyState === WebSocket.OPEN) {
                currentWs.close()
              }
            }, WEBSOCKET_CLOSE_DELAY_MS)
          } catch (error) {
            currentWs.close()
          }
        } else if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
          currentWs.close()
        }
      }
      
      clearTimeoutRef(streamingTimeoutRef)
      clearTimeoutRef(aiTypingTimeoutRef)
      clearTimeoutRef(sttTimeoutRef)
    }
  }, [])

  // ========================================
  // 반환값
  // ========================================
  return {
    // 세션 상태
    isSession,
    messages,
    selectedTitle,
    selectedBody,
    view,
    setView,
    summaryTab,
    setSummaryTab,
    evaluating,
    bottomRef,
    sessionInfo, // sessionId 포함
    
    // 입력 모드 상태
    isKeyboardMode,
    textInput,
    isRecording,
    setIsRecording,
    
    // 세션 제어 핸들러
    startWithMic,
    endSession,
    handleFeedbackView,
    
    // 입력 핸들러
    toggleKeyboardMode,
    handleTextInputChange,
    sendMessage,
    handleMicToggle,
    
    // TTS 및 아바타 상태
    isTTSPlaying,
    isAvatarLoaded,
    handleAvatarLoad,
    visemeQueue,
    audioRef
  }
}
