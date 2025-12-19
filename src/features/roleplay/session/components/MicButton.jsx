import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import MicNoneIcon from '@mui/icons-material/MicNone'
import KeyboardButton from './KeyboardButton'

export default function MicButton({ 
  onClick, 
  isRecording = false,
  onKeyboardToggle,
  isKeyboardMode = false,
  showModeToggle = true, // 모드 전환 버튼 표시 여부
  isTTSPlaying = false, // TTS 재생 중 여부
  isEvaluating = false // 평가 중 여부
}) {
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        py: 0.5, 
        minHeight: 72 
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* 녹음 중 텍스트 - 버튼 위쪽에 고정 */}
        {isRecording && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute',
              bottom: '100%',
              mb: 0.75,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.85)',
              whiteSpace: 'nowrap'
            }}
          >
            녹음 중
          </Typography>
        )}
        {/* 평가 중 텍스트 - 버튼 위쪽에 고정 */}
        {isEvaluating && !isRecording && !isTTSPlaying && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute',
              bottom: '100%',
              mb: 0.75,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'rgba(124, 108, 255, 0.85)',
              whiteSpace: 'nowrap'
            }}
          >
            평가하는 중
          </Typography>
        )}
        {/* TTS 재생 중 텍스트 - 버튼 위쪽에 고정 */}
        {isTTSPlaying && !isRecording && !isEvaluating && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute',
              bottom: '100%',
              mb: 0.75,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'rgba(108, 99, 255, 0.85)',
              whiteSpace: 'nowrap'
            }}
          >
            AI가 말하는 중...
          </Typography>
        )}
        {/* 마이크 버튼 - 위치 고정 */}
        <IconButton
          color="primary"
          onClick={onClick}
          disabled={isTTSPlaying}
          sx={{
            width: 64,
            height: 64,
            border: isRecording ? 'none' : '1px solid rgba(0,0,0,0.2)',
            background: isRecording 
              ? 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)' 
              : isTTSPlaying 
                ? '#f5f5f5' 
                : '#FFFFFF',
            color: isRecording ? '#FFFFFF' : isTTSPlaying ? '#9e9e9e' : '#212121',
            borderRadius: '50%',
            boxShadow: 'none',
            transition: 'transform 0.15s ease',
            '&:hover': { 
              background: isRecording 
                ? 'linear-gradient(135deg, #FF7B7B 0%, #FF6262 100%)' 
                : isTTSPlaying
                  ? '#f5f5f5'
                  : '#f5f5f5',
              borderColor: isRecording ? 'none' : 'rgba(0,0,0,0.3)'
            },
            '&:active': { transform: 'scale(0.97)' },
            '&.Mui-disabled': {
              backgroundColor: '#f5f5f5',
              color: '#9e9e9e'
            }
          }}
          aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
        >
          <MicNoneIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {!isKeyboardMode && showModeToggle && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateX(90px)'
          }}
        >
          <KeyboardButton 
            onClick={onKeyboardToggle} 
            isActive={false}
          />
        </Box>
      )}
    </Box>
  )
}
