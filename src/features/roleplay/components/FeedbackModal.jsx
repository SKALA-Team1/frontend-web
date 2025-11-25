import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography } from '@mui/material'
import feedbackHistoryData from '../../../data/roleplayFeedbackHistory.json'

export default function FeedbackModal({
  open,
  onClose,
  onSelect
}) {
  const feedbackHistory = feedbackHistoryData

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>피드백 내역 선택</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          {feedbackHistory.map((history) => (
            <Button
              key={history.id}
              variant="outlined"
              onClick={onSelect}
              sx={{ justifyContent: 'space-between', textTransform: 'none' }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" fontWeight={700}>{history.label}</Typography>
                <Typography variant="body2" color="text.primary">
                  {history.date} • {history.time}
                </Typography>
              </Box>
            </Button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  )
}

