import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function SessionHeader({ title, onEndSession }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const displayTitle = title || 'Roleplay'
  const textRef = useRef(null)
  const containerRef = useRef(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [scrollDistance, setScrollDistance] = useState(0)

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth
        const containerWidth = containerRef.current.offsetWidth
        const needsScroll = textWidth > containerWidth
        setShouldScroll(needsScroll)
        if (needsScroll) {
          setScrollDistance(textWidth - containerWidth)
        }
      }
    }

    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 체크
    const timeoutId = setTimeout(checkOverflow, 100)
    window.addEventListener('resize', checkOverflow)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [displayTitle])

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        px: 1,
        py: 0
      }}
    >
      <IconButton
        size="small"
        onClick={onEndSession}
        aria-label="세션 종료"
        sx={{
          border: '1px solid rgba(0,0,0,0.35)',
          borderRadius: '4px',
          width: 40,
          height: 36,
          mr: 1,
          flexShrink: 0,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.06)'
          }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
          mx: 1
        }}
      >
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Typography 
            ref={textRef}
            variant="h6" 
            align={shouldScroll ? 'left' : 'center'}
            style={
              shouldScroll && scrollDistance > 0
                ? { '--scroll-distance': `-${scrollDistance}px` }
                : {}
            }
            sx={{ 
              fontWeight: 700, 
              fontSize: '0.9375rem',
              color: '#212121',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              ...(shouldScroll && scrollDistance > 0 && {
                animation: 'scroll-text 8s linear infinite',
                '@keyframes scroll-text': {
                  '0%': {
                    transform: 'translateX(0)'
                  },
                  '100%': {
                    transform: 'translateX(var(--scroll-distance))'
                  }
                }
              })
            }}
          >
            {displayTitle}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: 40, flexShrink: 0 }} />
    </Box>
  )
}
