import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material'
import { updateProfile } from '../../../services/userService'
import { ROUTES } from '../../../config/constants'
import useNotification from '../../../hooks/useNotification'
import Notification from '../../../components/Common/Notification'

/**
 * 직무 입력 페이지
 * Google OAuth 로그인 후 job_role이 없을 때 표시되는 페이지
 */
export default function JobRoleInputPage() {
  const navigate = useNavigate()
  const notification = useNotification()
  const [jobRole, setJobRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!jobRole.trim()) {
      setError('직무를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await updateProfile({ jobRole: jobRole.trim() })
      
      notification.showSuccess('직무가 저장되었습니다.')
      
      // 성공 후 롤플레잉 페이지로 이동
      setTimeout(() => {
        navigate(ROUTES.ROLEPLAYING, { replace: true })
      }, 500)
    } catch (err) {
      console.error('직무 저장 실패:', err)
      setError(err.response?.data?.message || '직무 저장에 실패했습니다. 다시 시도해주세요.')
      notification.showError('직무 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        py: 2,
        px: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            textAlign: 'center'
          }}
        >
          직무 입력
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            textAlign: 'center'
          }}
        >
          롤플레잉을 시작하기 위해 직무를 입력해주세요.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="직무"
            placeholder="예: 개발자, 디자이너, 기획자"
            value={jobRole}
            onChange={(e) => {
              setJobRole(e.target.value)
              setError('')
            }}
            fullWidth
            error={!!error}
            helperText={error}
            disabled={loading}
            sx={{
              mb: 3
            }}
            autoFocus
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !jobRole.trim()}
            sx={{
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                저장 중...
              </>
            ) : (
              '저장하고 시작하기'
            )}
          </Button>
        </form>
      </Paper>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={notification.closeNotification}
      />
    </Box>
  )
}