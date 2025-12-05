import React from 'react'
import { Stack, Box } from '@mui/material'
import MessageBubble from './MessageBubble'

export default function MessageList({ messages, bottomRef }) {
  return (
    <Stack
      spacing={2}
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 1,
        py: 1,
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.23)',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.4)'
          }
        }
      }}
    >
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} index={index} />
      ))}
      <div ref={bottomRef} />
    </Stack>
  )
}

