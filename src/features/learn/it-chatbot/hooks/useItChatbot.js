import { useState, useCallback } from 'react'
import { chatWithBot } from '../../../../services/itExplanationService'

/**
 * IT 챗봇 대화 로직을 관리하는 훅
 */
export default function useItChatbot() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [conversationId, setConversationId] = useState(null)

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    setInputMessage('')

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    try {
      setLoading(true)
      setError(null)

      // 대화 히스토리 구성
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content
      }))

      const chatData = {
        user_message: userMessage,
        conversation_history: conversationHistory
      }

      const data = await chatWithBot(chatData)

      // 봇 응답 추가
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.bot_response }
      ])

      // conversation_id 저장
      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
    } catch (err) {
      console.error('[useItChatbot] 챗봇 응답 실패:', err)
      setError(err.message || '응답을 받는데 실패했습니다.')

      // 에러 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [inputMessage, messages])

  /**
   * 대화 초기화
   */
  const reset = useCallback(() => {
    setMessages([])
    setInputMessage('')
    setConversationId(null)
    setError(null)
  }, [])

  return {
    messages,
    inputMessage,
    loading,
    error,
    conversationId,
    setInputMessage,
    sendMessage,
    reset
  }
}
