import { useState } from 'react'
import { Button, Box, Typography, Card, CardContent } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import slackLogo from '../../../../images/slack_logo.png'
import { getSlackAuthUrl } from '../../../../services/integrationService'

/**
 * Slack 연동 유도 컴포넌트
 *
 * Props:
 * - isIntegrated: Slack 연동 완료 여부
 * - onChannelSelect: 채널 선택 버튼 클릭 시 콜백
 */
export default function SlackIntegrationPrompt({ isIntegrated = false, onChannelSelect }) {
  const [loading, setLoading] = useState(false)

  const handleSlackConnect = async () => {
    setLoading(true)
    try {
      const authUrl = await getSlackAuthUrl()
      // Slack OAuth 페이지로 리다이렉트
      window.location.href = authUrl
    } catch (error) {
      console.error('[Slack] 연동 URL 조회 실패:', error)
      alert(error.message || 'Slack 연동을 시작할 수 없습니다.')
      setLoading(false)
    }
  }

  // 연동 완료된 경우
  if (isIntegrated) {
    return (
      <Card sx={{ p: 4, bgcolor: '#F0F9FF', borderColor: '#0288D1', borderWidth: 1, borderStyle: 'solid' }}>
        <CardContent>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#0288D1', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Slack 연동 완료
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              채널을 선택하여 시나리오를 생성할 수 있습니다.
            </Typography>
            <Button
              variant="contained"
              onClick={onChannelSelect}
              size="large"
              sx={{
                bgcolor: '#0288D1',
                '&:hover': { bgcolor: '#0277BD' }
              }}
            >
              채널 선택하기
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // 미연동 상태
  return (
    <Card sx={{ p: 4 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={slackLogo}
            alt="Slack Logo"
            sx={{
              width: 64,
              height: 64,
              mb: 2,
              objectFit: 'contain'
            }}
          />
          <Typography variant="h6" gutterBottom>
            Slack 워크스페이스 연동이 필요합니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            시나리오를 생성하려면 Slack 워크스페이스에 앱을 설치해주세요.
          </Typography>
          <Button
            variant="contained"
            onClick={handleSlackConnect}
            disabled={loading}
            size="large"
            sx={{
              bgcolor: '#4A154B',
              '&:hover': { bgcolor: '#350D36' }
            }}
          >
            <Box
              component="img"
              src={slackLogo}
              alt="Slack"
              sx={{
                width: 20,
                height: 20,
                mr: 1,
                objectFit: 'contain'
              }}
            />
            {loading ? '연동 중...' : 'Slack 연동하기'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

