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
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: '#FFFFFF',
          borderRadius: 4,
          border: '2px solid rgba(124,108,255,0.3)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #7C6CFF 0%, #4B3CF8 100%)',
            boxShadow: '0 2px 8px rgba(124,108,255,0.4)'
          }
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)'
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#212121',
          pb: 1,
          pt: 3.5,
          px: 3,
          textAlign: 'center'
        }}
      >
        롤플레이 만들기
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2, px: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#212121',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
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
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2.5,
                  transition: 'all 0.3s ease',
                  '& fieldset': {
                    borderColor: 'rgba(124,108,255,0.3)',
                    borderWidth: 2
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(124,108,255,0.04)',
                    '& fieldset': {
                      borderColor: 'rgba(124,108,255,0.5)'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(124,108,255,0.06)',
                    '& fieldset': {
                      borderColor: '#7C6CFF',
                      borderWidth: 2,
                      boxShadow: '0 0 0 3px rgba(124,108,255,0.15)'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#212121',
                  fontSize: '0.9375rem',
                  fontWeight: 500
                }
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#212121',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
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
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2.5,
                  transition: 'all 0.3s ease',
                  '& fieldset': {
                    borderColor: 'rgba(124,108,255,0.3)',
                    borderWidth: 2
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(124,108,255,0.04)',
                    '& fieldset': {
                      borderColor: 'rgba(124,108,255,0.5)'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(124,108,255,0.06)',
                    '& fieldset': {
                      borderColor: '#7C6CFF',
                      borderWidth: 2,
                      boxShadow: '0 0 0 3px rgba(124,108,255,0.15)'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#212121',
                  fontSize: '0.9375rem',
                  fontWeight: 500
                }
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#212121',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
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
              rows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2.5,
                  transition: 'all 0.3s ease',
                  '& fieldset': {
                    borderColor: 'rgba(124,108,255,0.3)',
                    borderWidth: 2
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(124,108,255,0.04)',
                    '& fieldset': {
                      borderColor: 'rgba(124,108,255,0.5)'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(124,108,255,0.06)',
                    '& fieldset': {
                      borderColor: '#7C6CFF',
                      borderWidth: 2,
                      boxShadow: '0 0 0 3px rgba(124,108,255,0.15)'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#212121',
                  fontSize: '0.9375rem',
                  fontWeight: 500
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
            py: 1.25,
            borderRadius: 2.5,
            borderColor: 'rgba(124,108,255,0.3)',
            borderWidth: 2,
            color: '#7C6CFF',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textTransform: 'none',
            background: 'linear-gradient(135deg, rgba(124,108,255,0.05) 0%, rgba(75,60,248,0.03) 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(124,108,255,0.5)',
              borderWidth: 2,
              background: 'linear-gradient(135deg, rgba(124,108,255,0.12) 0%, rgba(75,60,248,0.08) 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(124,108,255,0.2)'
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
            py: 1.25,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
            boxShadow: '0 4px 16px rgba(124,108,255,0.3)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #8B7DFF 0%, #5B4DFF 100%)',
              boxShadow: '0 6px 20px rgba(124,108,255,0.4)',
              transform: 'translateY(-2px)'
            },
            '&:disabled': {
              background: 'rgba(124,108,255,0.4)',
              color: 'rgba(255,255,255,0.7)'
            }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <CircularProgress size={18} color="inherit" />
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





