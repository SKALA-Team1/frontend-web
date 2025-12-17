import React from 'react'
import { Stack, Box } from '@mui/material'
import MessageBubble from './MessageBubble'

export default function MessageList({ messages, bottomRef, onFetchKeywords, aiRole = 'AI' }) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        px: 1,
        py: 1,
        backgroundColor: 'transparent',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
          borderRadius: '1.5px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '1.5px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.3)'
          }
        }
      }}
    >
      {messages.map((message, index) => {
        // 피드백 후 재질문인지 확인: 바로 이전 메시지가 피드백 메시지인지 확인
        const isRetryQuestion = message.who === 'AI' && 
          !message.isStreaming && 
          message.text && 
          index > 0 && 
          (() => {
            const prevMessage = messages[index - 1]
            return prevMessage.who === 'AI' && 
              prevMessage.feedbackSections && 
              Array.isArray(prevMessage.feedbackSections) && 
              prevMessage.feedbackSections.length > 0
          })()
        
        return (
          <MessageBubble 
            key={index} 
            message={message} 
            index={index} 
            onFetchKeywords={onFetchKeywords}
            aiRole={aiRole}
            isRetryQuestion={isRetryQuestion}
          />
        )
      })}
      <div ref={bottomRef} />
    </Stack>
  )
}
