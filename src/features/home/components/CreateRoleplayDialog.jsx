import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Box, Typography, TextField, Button } from '@mui/material'

export default function CreateRoleplayDialog({
  open,
  onClose,
  aiRole,
  myRole,
  goal,
  onAiRoleChange,
  onMyRoleChange,
  onGoalChange,
  onStart
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
          border: '1px solid rgba(255,255,255,0.8)',
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
          color: '#F5F6FF',
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
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
                color: '#F5F6FF'
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
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.18)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#F5F6FF'
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
                color: '#F5F6FF'
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
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.18)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#F5F6FF'
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
                color: '#F5F6FF'
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
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.18)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C63FF'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#F5F6FF'
                }
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            borderColor: 'rgba(255,255,255,0.4)',
            color: '#F5F6FF',
            '&:hover': {
              borderColor: '#F5F6FF',
              backgroundColor: 'rgba(255,255,255,0.08)'
            }
          }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={onStart}
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #7C6CFF 0%, #5546D7 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #8473ff 0%, #5c4ee2 100%)'
            }
          }}
        >
          롤플레이 시작
        </Button>
      </DialogActions>
    </Dialog>
  )
}





