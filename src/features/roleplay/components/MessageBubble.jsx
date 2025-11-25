import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'

const MESSAGE_STYLES = {
  You: {
    bgcolor: 'rgba(124,108,255,0.25)',
    borderColor: 'rgba(124,108,255,0.4)',
    justifyContent: 'flex-end'
  },
  AI: {
    bgcolor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'flex-start'
  }
}

// 타이핑 속도 (ms per character) - 스트리밍 중에는 더 빠르게
const TYPING_SPEED = 30
const STREAMING_TYPING_SPEED = 15 // 스트리밍 중에는 더 빠른 타이핑

function MessageBubble({ message, index }) {
  const { who, text, isStreaming } = message || {}
  const style = MESSAGE_STYLES[who] || MESSAGE_STYLES.AI
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const prevTextLengthRef = useRef(0) // 이전에 표시된 텍스트 길이 추적
  const typingIntervalRef = useRef(null)
  const hasTypedRef = useRef(false) // 타이핑 효과가 이미 적용되었는지 추적
  const prevIsStreamingRef = useRef(null) // 이전 스트리밍 상태 추적
  const isCompletedRef = useRef(false) // 메시지가 완료되었는지 추적 (더 이상 업데이트 안됨)
  const prevTextRef = useRef('') // 이전 텍스트 추적
  const messageKeyRef = useRef('') // 메시지 고유 키 (초기값은 빈 문자열)
  const displayedTextRef = useRef('') // 현재 표시된 텍스트 추적 (ref로 관리)
  const targetTextRef = useRef('') // 타이핑할 목표 텍스트 (ref로 관리하여 최신 값 유지)
  const currentTypingIndexRef = useRef(0) // 현재 타이핑 중인 인덱스 (ref로 관리)

  // 메시지가 변경되면 상태 리셋 (메시지 키 기반)
  useEffect(() => {
    // 메시지 키 생성: index와 텍스트의 첫 부분을 조합
    const textPrefix = text ? text.substring(0, 20) : ''
    const currentKey = `${index}-${textPrefix}`
    
    if (messageKeyRef.current !== currentKey) {
      // 새로운 메시지이므로 상태 리셋
      isCompletedRef.current = false
      hasTypedRef.current = false
      prevTextLengthRef.current = 0
      prevIsStreamingRef.current = null
      prevTextRef.current = ''
      messageKeyRef.current = currentKey
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
      setDisplayedText('')
      displayedTextRef.current = ''
      targetTextRef.current = ''
      currentTypingIndexRef.current = 0
      setIsTyping(false)
    }
  }, [index, text])

  // AI 메시지 처리 (최적화: 불필요한 업데이트 방지)
  useEffect(() => {
    if (who !== 'AI') {
      // 사용자 메시지: STT 중이면 타이핑 효과, 아니면 즉시 표시
      const isSTT = message?.isSTT || false
      
      if (isSTT) {
        // STT 부분 결과: 새로 추가된 부분만 타이핑 효과
        const currentDisplayedLength = displayedTextRef.current ? displayedTextRef.current.length : 0
        
        if (text.length > currentDisplayedLength) {
          if (!typingIntervalRef.current) {
            setIsTyping(true)
            currentTypingIndexRef.current = currentDisplayedLength
            
            typingIntervalRef.current = setInterval(() => {
              if (currentTypingIndexRef.current < text.length) {
                const newDisplayed = text.substring(0, currentTypingIndexRef.current + 1)
                setDisplayedText(newDisplayed)
                displayedTextRef.current = newDisplayed
                currentTypingIndexRef.current++
              } else {
                prevTextLengthRef.current = text.length
                displayedTextRef.current = text
                setDisplayedText(text)
                setIsTyping(false)
                clearInterval(typingIntervalRef.current)
                typingIntervalRef.current = null
              }
            }, STREAMING_TYPING_SPEED)
          } else {
            // 이미 타이핑 중이면 인덱스 업데이트
            if (currentTypingIndexRef.current < currentDisplayedLength) {
              currentTypingIndexRef.current = currentDisplayedLength
            }
          }
        }
        prevTextRef.current = text
        return
      } else {
        // STT 완료: 즉시 표시
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        setDisplayedText(text)
        displayedTextRef.current = text
        setIsTyping(false)
        prevTextLengthRef.current = text.length
        hasTypedRef.current = false
        isCompletedRef.current = true
        prevTextRef.current = text
        return
      }
    }

    // ✅ 메시지가 이미 완료되었고 텍스트가 변경되지 않았으면 업데이트하지 않음
    // 단, 새로운 메시지(텍스트가 처음 설정되는 경우)는 제외
    if (isCompletedRef.current && !isStreaming && text === prevTextRef.current && prevTextRef.current.length > 0) {
      return
    }
    
    // ✅ 스트리밍이 완료되고 텍스트가 더 이상 변경되지 않으면 완료 상태로 표시
    // displayedText가 비어있지 않고 텍스트와 일치하는 경우에만 완료 처리
    if (!isStreaming && text && text === prevTextRef.current && displayedText && displayedText === text && displayedText.length > 0) {
      isCompletedRef.current = true
      return
    }
    // ✅ 스트리밍 중인 경우: 새로 추가된 부분만 음절 하나씩 타이핑 효과로 표시
    if (isStreaming) {
      const newText = text
      // 실제로 화면에 표시된 텍스트 길이를 기준으로 사용 (가장 정확함)
      const currentDisplayedLength = displayedTextRef.current ? displayedTextRef.current.length : 0
      const prevLength = currentDisplayedLength // 이미 표시된 텍스트 길이
      
      // 새로 추가된 부분이 있으면 타이핑 시작
      if (newText.length > prevLength) {
        targetTextRef.current = newText // 최신 텍스트를 ref에 저장
        
        // prevTextLengthRef도 동기화 (다음 계산을 위해)
        prevTextLengthRef.current = prevLength
        
        // 타이핑 interval이 없으면 시작
        if (!typingIntervalRef.current) {
          setIsTyping(true)
          hasTypedRef.current = true
          currentTypingIndexRef.current = prevLength // 현재 타이핑 중인 인덱스 (이미 표시된 길이부터 시작)
          
          // 새로 추가된 부분만 음절 하나씩 타이핑하는 interval 시작
          typingIntervalRef.current = setInterval(() => {
            const targetText = targetTextRef.current // ref에서 최신 텍스트 가져오기
            const currentDisplayed = displayedTextRef.current || ''
            
            // 새로 추가된 부분이 더 있으면 한 글자씩 추가
            if (currentTypingIndexRef.current < targetText.length) {
              const newDisplayed = targetText.substring(0, currentTypingIndexRef.current + 1)
              setDisplayedText(newDisplayed)
              displayedTextRef.current = newDisplayed
              currentTypingIndexRef.current++
            } else {
              // 현재까지의 텍스트 타이핑 완료
              prevTextLengthRef.current = targetText.length
              displayedTextRef.current = targetText
              setDisplayedText(targetText)
              // interval은 계속 실행 (다음 청크 대기)
            }
          }, STREAMING_TYPING_SPEED)
        } else {
          // interval이 이미 실행 중이면, currentTypingIndexRef를 현재 표시된 텍스트 길이로 동기화
          // 이렇게 하면 이미 표시된 텍스트는 건너뛰고 새로 추가된 부분만 타이핑
          if (currentTypingIndexRef.current < currentDisplayedLength) {
            currentTypingIndexRef.current = currentDisplayedLength
          }
          // prevTextLengthRef도 동기화
          prevTextLengthRef.current = currentDisplayedLength
        }
      }
      
      // 텍스트가 줄어든 경우 (리셋 등)
      if (newText.length < prevTextLengthRef.current) {
        setDisplayedText(newText)
        displayedTextRef.current = newText
        prevTextLengthRef.current = newText.length
        targetTextRef.current = newText
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
      }
    } else {
        // ✅ 스트리밍 완료 또는 이미 생성된 텍스트 (고정 질문 등)
        // 이전 타이핑 인터벌 정리
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
        
        // 스트리밍 중에 이미 타이핑이 완료된 경우, 완료 후에는 즉시 표시
        if (hasTypedRef.current && prevIsStreamingRef.current === true) {
          
          // 스트리밍 중에 이미 타이핑이 완료되었으므로, 완료 후에는 즉시 전체 텍스트 표시
          if (displayedText !== text) {
            setDisplayedText(text)
            displayedTextRef.current = text
            targetTextRef.current = text
          }
          setIsTyping(false) // 커서 제거
          prevTextLengthRef.current = text.length
          isCompletedRef.current = true
          prevTextRef.current = text
        } else {
          // ✅ 이미 생성된 텍스트 (고정 질문 등): 타이핑 효과로 표시
          if (text && text.length > 0) {
            // displayedText가 비어있거나 텍스트와 다른 경우에만 타이핑 시작
            if (!displayedText || displayedText.length === 0 || displayedText !== text) {
              setIsTyping(true)
              setDisplayedText('')
              displayedTextRef.current = ''
              prevTextLengthRef.current = 0
              hasTypedRef.current = true
              
              let currentIndex = 0
              typingIntervalRef.current = setInterval(() => {
                if (currentIndex < text.length) {
                  const newDisplayed = text.substring(0, currentIndex + 1)
                  setDisplayedText(newDisplayed)
                  displayedTextRef.current = newDisplayed
                  currentIndex++
                } else {
                  setIsTyping(false)
                  prevTextLengthRef.current = text.length
                  isCompletedRef.current = true
                  prevTextRef.current = text
                  displayedTextRef.current = text
                  clearInterval(typingIntervalRef.current)
                  typingIntervalRef.current = null
                }
              }, TYPING_SPEED)
            }
          }
        }
      }
    
    // 이전 스트리밍 상태 저장
    prevIsStreamingRef.current = isStreaming
    prevTextRef.current = text
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
    }
  }, [text, who, isStreaming, message?.isSTT])

  return (
    <Box sx={{ display: 'flex', justifyContent: style.justifyContent, px: 1 }}>
      <Box
        sx={{
          maxWidth: '80%',
          bgcolor: style.bgcolor,
          color: '#F5F6FF',
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: `1px solid ${style.borderColor}`,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            opacity: 0.8,
            fontWeight: 600,
            display: 'block',
            mb: 0.5
          }}
        >
          {who}
        </Typography>
        <Typography 
          variant="body2"
          sx={{
            lineHeight: 1.6,
            wordBreak: 'break-word',
            minHeight: '1.5em' // 타이핑 중 깜빡임 방지
          }}
        >
          {displayedText || text}
          {isTyping && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                bgcolor: '#F5F6FF',
                ml: 0.5,
                animation: 'blink 1s infinite',
                '@keyframes blink': {
                  '0%, 50%': { opacity: 1 },
                  '51%, 100%': { opacity: 0 }
                }
              }}
            />
          )}
        </Typography>
      </Box>
    </Box>
  )
}

// React.memo로 불필요한 리렌더링 방지
export default React.memo(MessageBubble, (prevProps, nextProps) => {
  // 메시지의 핵심 속성만 비교
  return (
    prevProps.message?.text === nextProps.message?.text &&
    prevProps.message?.who === nextProps.message?.who &&
    prevProps.message?.isStreaming === nextProps.message?.isStreaming &&
    prevProps.index === nextProps.index
  )
})

