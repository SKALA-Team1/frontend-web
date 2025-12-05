import React, { useState } from 'react'
import { 
  Typography, 
  Stack, 
  Avatar, 
  Box, 
  Card, 
  CardContent, 
  Button,
  LinearProgress,
  Divider,
  IconButton,
  Collapse
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import useUserPage from '../hooks/useUserPage'
import BookmarkList from '../components/BookmarkList'

export default function UserPage() {
  const {
    email,
    bookmarkedSentences,
    recordings
  } = useUserPage()

  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false)

  // Mock 데이터
  const completedRoleplays = 24
  const totalRoleplays = 30
  const completedPercentage = Math.round((completedRoleplays / totalRoleplays) * 100)
  const averageScore = 88
  const streakDays = 7

  return (
    <Stack spacing={3}>
      {/* 프로필 헤더 */}
      <Card
        variant="outlined"
        sx={{
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: 'rgba(0,0,0,0.03)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <CardContent>
          <Stack spacing={2.5}>
            {/* 아바타, 이름, 연속 학습 */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 72, 
                  height: 72, 
                  bgcolor: 'rgba(124,108,255,0.3)',
                  border: '2px solid rgba(124,108,255,0.5)',
                  fontSize: '1.5rem',
                  fontWeight: 700
                }}
              >
                SK
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                  SKALA 님
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 600
                    }}
                  >
                    🔥 {streakDays}일 연속 학습 중
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)' }} />

            {/* 완료한 롤플레잉 게이지 */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  완료한 롤플레잉
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {completedRoleplays}/{totalRoleplays} ({completedPercentage}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completedPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #7C6CFF 0%, #4B3CF8 100%)'
                  }
                }}
              />
            </Box>

            {/* 평균 점수 게이지 */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  평균 평가 점수
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
                  {averageScore}점 ({averageScore}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={averageScore}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #7C6CFF 0%, #4B3CF8 100%)'
                  }
                }}
              />
            </Box>

            <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)' }} />

            {/* 이메일 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                이메일
              </Typography>
              <Typography variant="body2" sx={{ color: '#212121' }}>
                {email}
              </Typography>
            </Box>

            {/* 개인정보 수정 버튼 */}
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={{
                borderColor: 'rgba(0,0,0,0.23)',
                color: '#212121',
                '&:hover': {
                  borderColor: 'rgba(124,108,255,0.8)',
                  bgcolor: 'rgba(124,108,255,0.1)'
                }
              }}
            >
              개인정보 수정
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 북마크한 문장 (토글) */}
      <Card
        variant="outlined"
        sx={{
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: 'rgba(0,0,0,0.03)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.03)'
              }
            }}
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}    //북마크 리스트 on off 처리
          >
            <Typography variant="subtitle1" fontWeight={700}>
              북마크한 문장
            </Typography>
            <IconButton 
              size="small"
              sx={{ 
                color: 'text.primary',
                transition: 'transform 0.2s ease',
                transform: isBookmarksOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          <Collapse in={isBookmarksOpen}>
            <Box sx={{ mt: 2 }}>
      <BookmarkList bookmarkedSentences={bookmarkedSentences} />
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Stack>
  )
}
