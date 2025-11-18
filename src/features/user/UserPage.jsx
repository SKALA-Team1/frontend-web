import React from 'react'
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  Divider,
  TextField,
  Chip
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import bookmarkedSentences from '../../data/myPageBookmarks.json'
import recordings from '../../data/myPageRecordings.json'

export default function UserPage() {

  const [email, setEmail] = React.useState('skala@company.com')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const handleAccountSave = () => {
    // 실제 저장 로직은 추후 연동
    alert('계정 정보가 업데이트되었습니다.')
  }

  return (
    <Stack spacing={3} sx={{ px: 6, py: 6 }}>
      <Typography variant="h5" fontWeight={700}>마이페이지</Typography>

      {/* 프로필 요약 */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'grey.900' }}>SK</Avatar>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h6" fontWeight={700}>SKALA 님</Typography>
                <Typography variant="body2" color="text.secondary">SW Engineering · 7일 연속 학습 중</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
            </Stack>
            <Divider />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">완료한 롤플레잉</Typography>
                <Typography variant="h6" fontWeight={700}>24개</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">북마크한 문장</Typography>
                <Typography variant="h6" fontWeight={700}>{bookmarkedSentences.length}개</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">평균 평가 점수</Typography>
                <Typography variant="h6" fontWeight={700}>88점</Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* 북마크 문장 */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <BookmarkIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>북마크한 문장</Typography>
          </Stack>
          <Stack spacing={2}>
            {bookmarkedSentences.map((item, idx) => (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'grey.50'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{item.scenario}</Typography>
                  <Chip label={`저장 ${idx + 1}`} size="small" />
                </Stack>
                <Typography variant="caption" color="text.secondary">AI 질문</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{item.ai}</Typography>
                <Typography variant="caption" color="text.secondary">내 답변</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{item.you}</Typography>
                <Typography variant="caption" color="text.secondary">제안 문장</Typography>
                <Typography variant="body2">{item.suggestion}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* 녹음 다시 듣기 */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <PlayCircleOutlineIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>대화 녹음 다시 듣기</Typography>
          </Stack>
          <Stack spacing={1.5}>
            {recordings.map((record) => (
              <Box
                key={record.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1.5
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{record.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {record.date} · {record.duration}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<PlayCircleOutlineIcon />}>
                    재생
                  </Button>
                  <Button variant="text" size="small">다운로드</Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* 계정 보안 */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>계정 보안</Typography>
          <Stack spacing={2}>
            <TextField
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="새 비밀번호"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleAccountSave} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}>
              정보 업데이트
            </Button>
          </Stack>
        </CardContent>
      </Card>

    </Stack>
  )
}


