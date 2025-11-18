import React from 'react'
import { Card, CardContent, Typography, Stack, Button, Grid, Avatar, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from '@mui/material'
import { dateForIndex } from '../../utils/dateUtils.js'
import homeScenarios from '../../data/homeScenarios.json'

export default function HomePage() {
  const [openCreate, setOpenCreate] = React.useState(false)
  const [aiRole, setAiRole] = React.useState('')
  const [myRole, setMyRole] = React.useState('')
  const [goal, setGoal] = React.useState('')

  const contents = homeScenarios

  return (
    <Stack spacing={2}>
      {/* 인사말 */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>S</Avatar>
        <Box>
          <Typography variant="h6">SKALA님</Typography>
          <Typography variant="caption" color="text.secondary">연속 학습 7 일째</Typography>
        </Box>
      </Stack>

      {/* 요약 카드 */}
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, p: 1.5, height: '100%' }}>
                <Typography variant="caption" color="text.secondary">내 부서</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>SW Engineering</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, p: 1.5, height: '100%' }}>
                <Typography variant="caption" color="text.secondary">우리 부서 등수</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>3위</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, p: 1.5, height: '100%' }}>
                <Typography variant="caption" color="text.secondary">나의 등수</Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>10위</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 맞춤 롤플레잉 CTA - 상단으로 이동 */}
      <Card variant="outlined" sx={{ bgcolor: 'primary.main', cursor: 'pointer', justifyItems: 'center' }} onClick={() => setOpenCreate(true)} role="button" tabIndex={0}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ color: 'common.white', fontWeight: 700}}>
            내 상황에 딱 맞는 롤플레잉
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            롤플레이 상황을 만들어보세요.
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="subtitle2" fontWeight={700}>
        나의 시나리오
      </Typography>

      {/* 롤플레잉 추천 목록 (6개, 최신 날짜순) */}
      <Stack spacing={1}>
        {contents
          .map((item, idx) => ({
            ...item,
            dateNum: 15 - (idx % 5),
            dateLabel: dateForIndex(idx)
          }))
          .sort((a, b) => b.dateNum - a.dateNum)
          .slice(0, 6)
          .map((item, idx) => (
          <Card key={idx} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>{item.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="업데이트 됨" size="small" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">{item.dateLabel}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {item.body}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* 롤플레이 생성 모달 */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="xs">
        <DialogTitle>롤플레이 만들기</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>AI 역할</Typography>
              <TextField fullWidth variant="standard" value={aiRole} onChange={(e) => setAiRole(e.target.value)} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>나의 역할</Typography>
              <TextField fullWidth variant="standard" value={myRole} onChange={(e) => setMyRole(e.target.value)} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>목적 상황</Typography>
              <TextField fullWidth variant="standard" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>취소</Button>
          <Button variant="contained" onClick={() => setOpenCreate(false)}>롤플레이 시작하기</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}


