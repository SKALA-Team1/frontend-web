import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material'

export default function CreateRoleplayDialog({
  open,
  onClose,
  aiRole,
  myRole,
  goal,
  onAiRoleChange,
  onMyRoleChange,
  onGoalChange,
  onStart,
  loading = false,
  errorMessage = null
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(17, 19, 26, 0.95)',
          border: '1px solid rgba(0,0,0,0.8)',
          borderRadius: 3,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.125rem',
          color: '#212121',
          pb: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        롤플레이 만들기
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                color: '#212121'
              }}
            >
              AI 역할
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={aiRole}
              onChange={onAiRoleChange}
              placeholder="예: Project Manager"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0,0,0,0.4)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#212121'
                }
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                color: '#212121'
              }}
            >
              나의 역할
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={myRole}
              onChange={onMyRoleChange}
              placeholder="예: Software Engineer"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0,0,0,0.4)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#212121'
                }
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                color: '#212121'
              }}
            >
              목적 상황
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={goal}
              onChange={onGoalChange}
              placeholder="예: 프로젝트 일정 조율 및 리스크 논의"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0,0,0,0.4)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#212121'
                }
              }}
            />
          </Box>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorMessage}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            borderColor: 'rgba(0,0,0,0.4)',
            color: '#212121',
            '&:hover': {
              borderColor: '#212121',
              backgroundColor: 'rgba(0,0,0,0.08)'
            }
          }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={onStart}
          disabled={loading}
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #7C6CFF 0%, #5546D7 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #8473ff 0%, #5c4ee2 100%)'
            }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <CircularProgress size={16} color="inherit" />
              생성 중...
            </Box>
          ) : (
            '시나리오 생성'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}





