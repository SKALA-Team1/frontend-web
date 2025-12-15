import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography, IconButton, Divider, Chip, Stack } from '@mui/material'
import TranslateIcon from '@mui/icons-material/Translate'
import LightbulbIcon from '@mui/icons-material/Lightbulb'

const MESSAGE_STYLES = {
  You: {
    bgcolor: 'rgba(124,108,255,0.25)',
    borderColor: 'rgba(124,108,255,0.4)',
    justifyContent: 'flex-end'
  },
  AI: {
    bgcolor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(0,0,0,0.23)',
    justifyContent: 'flex-start'
  }
}

// 타이핑 속도 (ms per character) - 스트리밍 중에는 더 빠르게
const TYPING_SPEED = 30
const STREAMING_TYPING_SPEED = 15 // 스트리밍 중에는 더 빠른 타이핑

function MessageBubble({ message, index, showTranslation, onToggleTranslation, onFetchKeywords }) {
  const { who, text, isStreaming, translation, recommendedKeywords, feedbackSections } = message || {}
  const style = MESSAGE_STYLES[who] || MESSAGE_STYLES.AI
  
  // 피드백 타입별 소제목 매핑
  const feedbackTypeLabels = {
    pronunciation: '발음',
    grammar: '문법',
    relevance: '문맥'
  }
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isTranslationVisible, setIsTranslationVisible] = useState(false)
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
    // 피드백 섹션이 있으면 타이핑 효과 건너뛰기
    if (feedbackSections && Array.isArray(feedbackSections) && feedbackSections.length > 0) {
      return
    }
    
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

  const shouldShowCursor = isTyping && (who !== 'AI' || isStreaming)
  const hasTranslation = who === 'AI' && translation
  const isAIQuestion = who === 'AI' && !isStreaming && text

  // 키워드 메시지인 경우 스타일 조정
  const isKeywordsMsg = message.isKeywordsMessage
  const messageStyle = isKeywordsMsg ? {
    bgcolor: 'rgba(124,108,255,0.05)',
    borderColor: 'rgba(124,108,255,0.2)'
  } : style

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: messageStyle.justifyContent, width: '100%', alignItems: messageStyle.justifyContent === 'flex-start' ? 'flex-start' : 'flex-end' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, maxWidth: '85%', position: 'relative' }}>
        <Box
          sx={{
            bgcolor: messageStyle.bgcolor,
            color: '#212121',
            px: 2,
            py: isKeywordsMsg ? 1 : 1.5,
            borderRadius: 1,
            border: `1px solid ${messageStyle.borderColor}`,
            backdropFilter: 'none',
            boxShadow: 'none',
            width: '100%',
            pb: hasTranslation && isTranslationVisible ? 0 : (isKeywordsMsg ? 1 : 1.5)
          }}
        >
          {!message.isKeywordsMessage && !(feedbackSections && Array.isArray(feedbackSections) && feedbackSections.length > 0) && (
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
          )}
          {/* 피드백 섹션이 있는 경우 */}
          {feedbackSections && Array.isArray(feedbackSections) && feedbackSections.length > 0 ? (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              {feedbackSections.map((section, idx) => (
                <Box key={idx}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#7C6CFF'
                      }}
                    >
                      {feedbackTypeLabels[section.type] || section.type}
                    </Typography>
                    {section.score !== undefined && section.score !== null && (
                      <Chip
                        label={`${section.score}점`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: 'rgba(124,108,255,0.1)',
                          color: '#7C6CFF',
                          fontWeight: 600,
                          border: '1px solid rgba(124,108,255,0.2)',
                          '& .MuiChip-label': {
                            px: 0.75,
                            py: 0
                          }
                        }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      fontSize: '0.75rem',
                      color: '#212121'
                    }}
                  >
                    {section.feedback_ko || section.feedback_en}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            !message.isKeywordsMessage && (
              <Typography 
                variant="body2"
                sx={{
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  minHeight: '1em', // 타이핑 중 깜빡임 방지
                  fontSize: '0.75rem'
                }}
              >
                {displayedText || text}
                {shouldShowCursor && (
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '2px',
                      height: '1em',
                      bgcolor: '#212121',
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
            )
          )}
          
          {hasTranslation && isTranslationVisible && (
            <>
              <Divider 
                sx={{ 
                  my: 0.5,
                  borderColor: 'rgba(0,0,0,0.12)'
                }} 
              />
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  color: '#424242',
                  fontSize: '0.75rem',
                  pb: 0.5
                }}
              >
                {translation}
              </Typography>
            </>
          )}
          
          {/* 키워드 메시지 표시 (사용자 메시지 영역에 표시) */}
          {message.isKeywordsMessage && recommendedKeywords && Array.isArray(recommendedKeywords) && recommendedKeywords.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.75 }}>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {recommendedKeywords.map((keyword, idx) => (
                  <Chip
                    key={idx}
                    label={keyword}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(124,108,255,0.1)',
                      color: '#7C6CFF',
                      fontWeight: 500,
                      border: '1px solid rgba(124,108,255,0.2)',
                      '& .MuiChip-label': {
                        px: 1,
                        py: 0
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
          {hasTranslation && (
            <IconButton
              size="small"
              onClick={() => setIsTranslationVisible(v => !v)}
              sx={{
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 0.5,
                width: 14,
                height: 14,
                flexShrink: 0,
                minWidth: 14,
                padding: 0,
                '&:hover': { bgcolor: '#f5f5f5' },
                '& .MuiSvgIcon-root': {
                  fontSize: '0.75rem'
                }
              }}
            >
              <TranslateIcon sx={{ fontSize: '0.75rem' }} />
            </IconButton>
          )}
          {isAIQuestion && onFetchKeywords && (
            <IconButton
              size="small"
              onClick={() => onFetchKeywords(text, index)}
              sx={{
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 0.5,
                width: 14,
                height: 14,
                flexShrink: 0,
                minWidth: 14,
                padding: 0,
                '&:hover': { bgcolor: '#f5f5f5' },
                '& .MuiSvgIcon-root': {
                  fontSize: '0.75rem'
                }
              }}
            >
              <LightbulbIcon sx={{ fontSize: '0.75rem' }} />
            </IconButton>
          )}
        </Box>
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
    prevProps.message?.translation === nextProps.message?.translation &&
    JSON.stringify(prevProps.message?.recommendedKeywords) === JSON.stringify(nextProps.message?.recommendedKeywords) &&
    JSON.stringify(prevProps.message?.feedbackSections) === JSON.stringify(nextProps.message?.feedbackSections) &&
    prevProps.index === nextProps.index
  )
})
