/**
 * 알림 (Snackbar) 컴포넌트
 * 
 * 역할:
 * - 사용자에게 피드백 메시지를 표시
 * - 재사용 가능한 공통 컴포넌트
 */

import React from 'react'
import { Snackbar, Alert } from '@mui/material'

export default function Notification({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 2000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        top: '17% !important', // 화면 상단과 중간의 중간 위치
      }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '70%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}



