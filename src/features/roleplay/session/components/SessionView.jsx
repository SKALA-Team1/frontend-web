import React from 'react'
import { Box } from '@mui/material'
import SessionHeader from './SessionHeader'
import AvatarWindow from './AvatarWindow'
import MessageList from './MessageList'
import MicButton from './MicButton'
import TextInputArea from './TextInputArea'

export default function SessionView({
  selectedTitle,
  messages,
  bottomRef,
  onEndSession,
  onMicClick = () => {},
  isRecording = false,
  isKeyboardMode = false,
  onKeyboardToggle,
  textInput = '',
  onTextInputChange,
  onSendMessage,
  isTTSPlaying = false,
  onAvatarLoad = () => {}
}) {
  return (
    <Box
      sx={{
        py: 0,
        px: { xs: 0, sm: 0 },
        height: { xs: 'calc(100dvh - 120px)', sm: 'calc(100dvh - 120px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'background.default'
      }}
    >
      <SessionHeader title={selectedTitle} onEndSession={onEndSession} />
      <AvatarWindow isTTSPlaying={isTTSPlaying} onAvatarLoad={onAvatarLoad} />
      <MessageList messages={messages} bottomRef={bottomRef} />
      
      {isKeyboardMode ? (
        <TextInputArea
          value={textInput}
          onChange={onTextInputChange}
          onSend={onSendMessage}
          onKeyboardToggle={onKeyboardToggle}
          onMicToggle={onKeyboardToggle}
          isKeyboardMode={isKeyboardMode}
        />
      ) : (
        <MicButton 
          onClick={onMicClick || (() => {})} 
          isRecording={isRecording}
          onKeyboardToggle={onKeyboardToggle}
          isKeyboardMode={isKeyboardMode}
        />
      )}
    </Box>
  )
}

