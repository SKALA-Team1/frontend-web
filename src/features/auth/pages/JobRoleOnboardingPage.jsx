import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert
} from '@mui/material'
import { ROUTES } from '../../../config/constants'
import { updateJobRole } from '../../../services/userService'

/**
 * 직무 입력 온보딩 페이지
 * 
 * 역할:
 * - Google OAuth 로그인 후 job_role이 없을 때 표시
 * - 사용자가 직무를 입력하면 DB에 저장하고 롤플레잉 페이지로 이동
 */
export default function JobRoleOnboardingPage() {
  const navigate = useNavigate()
  const [jobRole, setJobRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!jobRole.trim()) {
      setError('직무를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await updateJobRole(jobRole.trim())
      // 성공 시 롤플레잉 페이지로 이동
      navigate(ROUTES.ROLEPLAYING, { replace: true })
    } catch (err) {
      console.error('직무 저장 실패:', err)
      setError(err.message || '직무 저장에 실패했습니다. 다시 시도해주세요.')
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
        px: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 1.5,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography
              variant="h4"
              fontWeight={700}
              textAlign="center"
              sx={{
                background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              직무를 입력해주세요
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              롤플레이 시나리오 생성에 사용할 직무를 입력해주세요.
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="직무"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="예: 개발자, 디자이너, 마케터"
                  fullWidth
                  autoFocus
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !jobRole.trim()}
                  sx={{
                    height: 48,
                    borderRadius: 1,
                    background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  {loading ? '저장 중...' : '저장하고 시작하기'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
