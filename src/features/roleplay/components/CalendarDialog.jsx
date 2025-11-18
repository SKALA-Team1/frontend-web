import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material'

export default function CalendarDialog({
  open,
  onClose,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>기간 선택</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="시작 날짜"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="끝 날짜"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button variant="contained" onClick={onClose}>적용</Button>
      </DialogActions>
    </Dialog>
  )
}


