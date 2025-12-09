import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material'

export default function CreateRoleplayDialog({
  open,
  onClose,
  aiRole,
  myRole,
  situation,
  onAiRoleChange,
  onMyRoleChange,
  onSituationChange,
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
          backgroundColor: '#FFFFFF',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#111827',
          pb: 1.5,
        }}
      >
        롤플레이 만들기
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 1 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 0.75,
                fontWeight: 600,
                color: '#111827'
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
                  backgroundColor: '#F9FAFB',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.12)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0,0,0,0.25)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#111827'
                }
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 0.75,
                fontWeight: 600,
                color: '#111827'
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
                  backgroundColor: '#F9FAFB',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.12)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0,0,0,0.25)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#111827'
                }
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 0.75,
                fontWeight: 600,
                color: '#111827'
              }}
            >
              목적 상황
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={situation}
              onChange={onSituationChange}
              placeholder="예: 프로젝트 일정 조율 및 리스크 논의"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F9FAFB',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.12)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0,0,0,0.25)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#111827'
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
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            color: '#374151',
            '&:hover': {
              borderColor: '#111827',
              backgroundColor: 'rgba(0,0,0,0.04)'
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
            background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #7a72ff 0%, #5b53ec 100%)'
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





