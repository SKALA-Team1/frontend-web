/**
 * 알림 관리를 위한 커스텀 훅
 * 
 * 역할:
 * - Snackbar 상태 관리를 캡슐화
 * - 재사용 가능한 알림 로직 제공
 * 
 * 주요 기능:
 * - 알림 상태 관리: open, message, severity 상태를 중앙에서 관리
 * - 편의 메서드: showSuccess, showError, showInfo, showWarning으로 간편한 알림 표시
 * - 타입 안전성: severity 타입을 명시적으로 관리 (success, error, info, warning)
 * - 재사용성: 여러 컴포넌트에서 동일한 알림 로직 재사용 가능
 * - 상태 초기화: closeNotification으로 알림 상태 리셋
 */

import { useState } from 'react'

export default function useNotification() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('success')

  const showNotification = (msg, sev = 'success') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }

  const showSuccess = (msg) => showNotification(msg, 'success')
  const showError = (msg) => showNotification(msg, 'error')
  const showInfo = (msg) => showNotification(msg, 'info')
  const showWarning = (msg) => showNotification(msg, 'warning')

  const closeNotification = () => {
    setOpen(false)
  }

  return {
    open,
    message,
    severity,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeNotification,
  }
}

