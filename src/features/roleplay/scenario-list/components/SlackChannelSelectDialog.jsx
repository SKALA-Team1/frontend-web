import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
  Alert
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { getSlackChannels, selectSlackChannel } from '../../../../services/integrationService'

/**
 * Slack 채널 선택 다이얼로그
 *
 * Props:
 * - open: 다이얼로그 열림 상태
 * - onClose: 닫기 콜백
 * - onSuccess: 채널 선택 성공 시 콜백
 */
export default function SlackChannelSelectDialog({ open, onClose, onSuccess }) {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [error, setError] = useState(null)
  const [selectedChannelId, setSelectedChannelId] = useState(null)

  // 다이얼로그 열릴 때 채널 목록 조회
  useEffect(() => {
    if (open) {
      fetchChannels()
    }
  }, [open])

  const fetchChannels = async () => {
    setLoading(true)
    setError(null)
    try {
      const channelList = await getSlackChannels()
      setChannels(channelList)
    } catch (err) {
      console.error('[Slack] 채널 목록 조회 실패:', err)
      setError(err.message || '채널 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChannel = async (channelId) => {
    setSelecting(true)
    setError(null)
    try {
      await selectSlackChannel(channelId)
      setSelectedChannelId(channelId)

      // 성공 메시지 표시 후 닫기
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setSelectedChannelId(null)
      }, 1500)
    } catch (err) {
      console.error('[Slack] 채널 선택 실패:', err)
      const message = err.message || '채널 선택에 실패했습니다.'
      const isTimeout =
        message.toLowerCase().includes('timeout') ||
        message.includes('서버에 연결할 수 없습니다')
      setError(
        isTimeout
          ? '채널 선택 요청이 처리 중입니다. 잠시 후 새로고침하거나 다시 확인해주세요.'
          : message
      )
      setSelecting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Slack 채널 선택</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : selecting && !selectedChannelId ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              채널 선택 중입니다. 메시지 수집 및 시나리오 생성까지 잠시만 기다려주세요.
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : selectedChannelId ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6">채널 선택 완료!</Typography>
            <Typography variant="body2" color="text.secondary">
              7일간의 메시지를 수집하고 시나리오를 생성합니다.
            </Typography>
          </Box>
        ) : channels.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            사용 가능한 채널이 없습니다.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              시나리오 생성에 사용할 Slack 채널을 선택하세요.
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {channels.map((channel) => (
                <ListItem key={channel.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectChannel(channel.id)}
                    disabled={selecting}
                  >
                    <ListItemText
                      primary={`# ${channel.name}`}
                      secondary={channel.isMember ? '멤버' : ''}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={selecting}>
          {selectedChannelId ? '닫기' : '취소'}
        </Button>
        {error && (
          <Button onClick={fetchChannels} variant="outlined">
            다시 시도
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
