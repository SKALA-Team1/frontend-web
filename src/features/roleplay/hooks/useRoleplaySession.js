import { useState, useMemo, useRef, useEffect } from 'react'
import mockMessages from '../../../data/roleplayMockMessages.json'

export default function useRoleplaySession() {
  const [isSession, setIsSession] = useState(false)
  const [messages, setMessages] = useState([])
  const [selectedTitle, setSelectedTitle] = useState('')
  const [selectedBody, setSelectedBody] = useState('')
  const [view, setView] = useState('list') // list | session | summary
  const [summaryTab, setSummaryTab] = useState('summary') // summary | transcript
  const [evaluating, setEvaluating] = useState(false)
  const [summary, setSummary] = useState({ time: '10분', turns: 10, suggestions: 3 })
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isSession])

  const startWithMic = async (title, body) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (stream) stream.getTracks().forEach(t => t.stop())
      setSelectedTitle(title)
      setSelectedBody(body)
      setIsSession(true)
      setView('session')
      setMessages(mockMessages)
    } catch (e) {
      alert('마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.')
    }
  }

  const endSession = () => {
    setIsSession(false)
    setMessages([])
    setSummary({ time: '10분', turns: 10, suggestions: 3 })
    setEvaluating(true)
    setTimeout(() => {
      setEvaluating(false)
      setView('summary')
      setSummaryTab('summary')
    }, 3000)
  }

  const handleFeedbackView = (title, body) => {
    setSelectedTitle(title)
    setSelectedBody(body)
    setIsSession(false)
    setEvaluating(false)
    setView('summary')
    setSummaryTab('summary')
  }

  const toggleKeyboardMode = () => {
    setIsKeyboardMode(prev => !prev)
    setTextInput('')
  }

  const handleTextInputChange = (e) => {
    setTextInput(e.target.value)
  }

  const sendMessage = () => {
    if (!textInput.trim()) return

    const newMessage = {
      who: 'You',
      text: textInput.trim()
    }

    setMessages(prev => [...prev, newMessage])
    setTextInput('')

    // TODO: WebSocket으로 백엔드에 메시지 전송
    // 웹소켓 연결 후 여기에 추가 예정

    // 임시로 AI 응답 시뮬레이션 (나중에 WebSocket으로 교체)
    setTimeout(() => {
      const aiResponse = {
        who: 'AI',
        text: 'Thank you for your response. Let me think about that...'
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return {
    isSession,
    messages,
    selectedTitle,
    selectedBody,
    view,
    setView,
    summaryTab,
    setSummaryTab,
    evaluating,
    summary,
    bottomRef,
    isKeyboardMode,
    textInput,
    isRecording,
    setIsRecording,
    startWithMic,
    endSession,
    handleFeedbackView,
    toggleKeyboardMode,
    handleTextInputChange,
    sendMessage
  }
}


