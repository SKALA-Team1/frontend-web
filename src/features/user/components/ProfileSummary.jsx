import React, { useState, useEffect, useMemo } from 'react'
import { Avatar, Card, CardContent, Typography, Stack, Box, LinearProgress, Chip } from '@mui/material'
import { getCurrentUser } from '../../../services/userService'
import { fetchUserScenarios } from '../../../services/roleplayService'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

export default function ProfileSummary() {
  const [userName, setUserName] = useState('')
  const [userInitials, setUserInitials] = useState('SK')
  const [scenarios, setScenarios] = useState([])
  const streakDays = 7

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getCurrentUser()
        const name = userInfo.name || userInfo.username || '사용자'
        setUserName(name)
        
        // 이름의 첫 글자로 이니셜 생성
        if (name && name.length > 0) {
          const initials = name.length >= 2 
            ? name.substring(0, 2).toUpperCase()
            : name.substring(0, 1).toUpperCase()
          setUserInitials(initials)
        }
      } catch (error) {
        console.warn('[ProfileSummary] 사용자 정보 로드 실패:', error)
        setUserName('사용자')
      }
    }

    loadUserInfo()
  }, [])

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const result = await fetchUserScenarios()
        setScenarios(Array.isArray(result) ? result : [])
      } catch (error) {
        console.warn('[ProfileSummary] 시나리오 로드 실패:', error)
        setScenarios([])
      }
    }

    loadScenarios()
  }, [])

  // 완료율 계산
  const completionStats = useMemo(() => {
    const total = scenarios.length
    const completed = scenarios.filter((item) => 
      item.status === 'FINISHED' || item.status === 'finished'
    ).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { total, completed, percentage }
  }, [scenarios])

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(124,108,255,0.1) 0%, rgba(75,60,248,0.05) 100%)',
        border: '1px solid rgba(124,108,255,0.2)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(124,108,255,0.15)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #7C6CFF 0%, #4B3CF8 100%)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2.5} alignItems="flex-start">
            <Avatar 
              variant="rounded"
              sx={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                border: '3px solid rgba(255,255,255,0.9)',
                fontSize: '1.75rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(124,108,255,0.3)',
                borderRadius: 1
              }}
            >
              {userInitials}
            </Avatar>
            <Box sx={{ flex: 1, pt: 0.5 }}>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                sx={{ 
                  mb: 1.5,
                  background: 'linear-gradient(135deg, #212121 0%, #424242 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {userName || '사용자'} 님
              </Typography>
              
              {/* 연속 학습 */}
              <Chip
                icon={<LocalFireDepartmentIcon sx={{ fontSize: 18 }} />}
                label={`${streakDays}일 연속 학습 중`}
                sx={{ 
                  width: 'fit-content',
                  background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,193,7,0.15) 100%)',
                  border: '1px solid rgba(255,152,0,0.3)',
                  color: '#FF6F00',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  height: 32,
                  '& .MuiChip-icon': {
                    color: '#FF6F00'
                  }
                }}
              />
            </Box>
          </Stack>
          
          {/* 완료한 롤플레잉 % 게이지 */}
          <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      완료한 롤플레잉
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ 
                    background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {completionStats.completed}/{completionStats.total} ({completionStats.percentage}%)
              </Typography>
            </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completionStats.percentage} 
                  sx={{
                    width: '100%',
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #7C6CFF 0%, #4B3CF8 100%)',
                      boxShadow: '0 2px 8px rgba(124,108,255,0.4)'
                    }
                  }}
                />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
