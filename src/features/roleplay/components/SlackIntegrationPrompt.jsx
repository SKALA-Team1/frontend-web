import { Button, Box, Typography, Card, CardContent } from '@mui/material'
import slackLogo from '../../../images/slack_logo.png'
import { getSlackLoginUrl } from '../../../services/integrationService'
import { getUserIdFromToken } from '../../../utils/jwt'

/**
 * Slack 연동 유도 컴포넌트
 * Slack 미연동 사용자에게 표시되는 화면
 */
export default function SlackIntegrationPrompt() {
  const handleSlackConnect = () => {
    const userId = getUserIdFromToken()
    if (!userId) {
      alert('로그인이 필요합니다.')
      return
    }
    
    try {
      const url = getSlackLoginUrl(userId)
      // Slack OAuth 페이지로 리다이렉트
      window.location.href = url
    } catch (error) {
      console.error('[Slack] 연동 URL 생성 실패:', error)
      alert(error.message || 'Slack 연동을 시작할 수 없습니다.')
    }
  }

  return (
    <Card sx={{  p: 4 }}>
      <CardContent>
        <Box sx={{ textAlign: 'center'}}>
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
            Slack 연동하기
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

