import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

export default function EndSessionDialog({
  open,
  onClose,
  onConfirm
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>종료하시겠습니까?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.primary">
          현재 진행 중인 롤플레이가 종료됩니다. 저장된 내용은 유지되지 않습니다.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={onConfirm}>
          예
        </Button>
      </DialogActions>
    </Dialog>
  )
}


