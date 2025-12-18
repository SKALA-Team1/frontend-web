import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material'

export default function CalendarDialog({
  open,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  // 임시 상태로 날짜 선택 관리
  const [tempStartDate, setTempStartDate] = useState(startDate || '')
  const [tempEndDate, setTempEndDate] = useState(endDate || '')

  // 다이얼로그가 열릴 때마다 현재 날짜로 초기화
  useEffect(() => {
    if (open) {
      setTempStartDate(startDate || '')
      setTempEndDate(endDate || '')
    }
  }, [open, startDate, endDate])

  const handleApply = () => {
    // 적용 버튼을 누를 때만 실제 상태 업데이트
    onStartDateChange(tempStartDate)
    onEndDateChange(tempEndDate)
    onClose()
  }

  const handleClose = () => {
    // 닫기 버튼을 누르면 임시 상태를 초기화하고 닫기
    setTempStartDate(startDate || '')
    setTempEndDate(endDate || '')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>기간 선택</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="시작 날짜"
            type="date"
            fullWidth
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="끝 날짜"
            type="date"
            fullWidth
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>닫기</Button>
        <Button variant="contained" onClick={handleApply}>적용</Button>
      </DialogActions>
    </Dialog>
  )
}


