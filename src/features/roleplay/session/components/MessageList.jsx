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
        overflowX: 'hidden',
        px: 1,
        py: 1,
        backgroundColor: 'transparent',
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
          borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.3)'
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
