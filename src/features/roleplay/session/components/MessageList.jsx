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
      {messages.map((message, index) => (
        <MessageBubble 
          key={index} 
          message={message} 
          index={index} 
          onFetchKeywords={onFetchKeywords}
          aiRole={aiRole}
        />
      ))}
      <div ref={bottomRef} />
    </Stack>
  )
}
