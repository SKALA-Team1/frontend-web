import React, { memo, useCallback, useState } from 'react'
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SlackIntegrationPrompt from './SlackIntegrationPrompt'
import SlackChannelSelectDialog from './SlackChannelSelectDialog'

function ScenarioList({
  tab,
  setTab,
  filteredItems = [],
  totalScenarios = 0,
  isSlackIntegrated = false,
  pendingSlackGeneration = false,
  onChannelSelected = () => {},
  userJobRole = null,
  onStartRoleplay,
  onViewFeedback,
  loading = false,
  error = null,
  onRetry,
  onOpenCalendar
}) {
  // Detail 시나리오의 AI 역할 선택 상태 관리
  const [selectedAiRoleIndices, setSelectedAiRoleIndices] = useState({})

  // Slack 채널 선택 모달 상태
  const [channelSelectOpen, setChannelSelectOpen] = useState(false)
  const [channelSelected, setChannelSelected] = useState(false)

  const handleStart = useCallback((item) => {
    // 그룹화된 Detail 시나리오인 경우, 선택된 AI 역할의 scenarioId 사용
    let scenarioId = item.scenarioId || 1
    let aiRole = item.aiRole
    
    if (item.isGrouped && item.groupType === 'detail' && item.availableAiRoles) {
      const selectedIndex = selectedAiRoleIndices[item.scenarioId] ?? item.selectedAiRoleIndex ?? 0
      const selectedRole = item.availableAiRoles[selectedIndex]
      if (selectedRole) {
        scenarioId = selectedRole.scenarioId
        aiRole = selectedRole.aiRole
      }
    }
    
    const body = item.description || item.summary || `AI 역할 ${aiRole}과의 대화`
    onStartRoleplay(item.title, body, scenarioId)
  }, [onStartRoleplay, selectedAiRoleIndices])

  const handleAiRoleChange = useCallback((scenarioId, index) => {
    setSelectedAiRoleIndices(prev => ({
      ...prev,
      [scenarioId]: index
    }))
  }, [])

  // 전체 시나리오 개수 사용 (ProfileSummary의 completionStats.total과 동일)
  const scenarioCount = totalScenarios > 0 ? totalScenarios : filteredItems.length

  // Slack 탭에서 시나리오가 없을 때: 채널 선택/진행 상태 표시
  if (tab === 'linked' && !loading && filteredItems.length === 0) {
    return (
      <>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab value="linked" label="Slack" />
          <Tab value="created" label="나의 롤플레잉" />
        </Tabs>
        {!channelSelected && (
          <SlackIntegrationPrompt
            isIntegrated={isSlackIntegrated}
            onChannelSelect={() => setChannelSelectOpen(true)}
          />
        )}
        {channelSelected && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Slack 채널을 선택했습니다. 메시지 수집 및 시나리오 생성이 진행 중입니다.
          </Alert>
        )}
        <SlackChannelSelectDialog
          open={channelSelectOpen}
          onClose={() => setChannelSelectOpen(false)}
          onSuccess={() => {
            setChannelSelected(true)
            onChannelSelected?.()
            // 채널 선택 성공 시 시나리오 목록 새로고침
            onRetry?.()
          }}
        />
      </>
    )
  }

  return (
    <>
      <Tabs 
        value={tab} 
        onChange={(_, v) => setTab(v)} 
        variant="fullWidth"
        sx={{
          mb: 1.5,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #7C6CFF 0%, #4B3CF8 100%)'
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 700
            }
          }
        }}
      >
        <Tab value="linked" label="Slack" />
        <Tab value="created" label="나의 롤플레잉" />
      </Tabs>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        px: 0.5
      }}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          총 <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{scenarioCount}</Box>개 시나리오
        </Typography>
        {onOpenCalendar && (
          <IconButton 
            onClick={onOpenCalendar} 
            size="small" 
            aria-label="달력 열기"
            sx={{
              border: '1px solid rgba(0,0,0,0.12)',
              '&:hover': {
                backgroundColor: 'rgba(124,108,255,0.08)',
                borderColor: 'primary.main'
              }
            }}
          >
            <CalendarMonthIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                다시 시도
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {filteredItems.map((item, idx) => {
            // 그룹화된 Detail 시나리오인 경우, 선택된 AI 역할 정보 가져오기
            let displayAiRole = item.aiRole
            if (item.isGrouped && item.groupType === 'detail' && item.availableAiRoles) {
              const selectedIndex = selectedAiRoleIndices[item.scenarioId] ?? item.selectedAiRoleIndex ?? 0
              const selectedRole = item.availableAiRoles[selectedIndex]
              if (selectedRole) {
                displayAiRole = selectedRole.aiRole
              }
            }
            
            return (
            <Card 
              key={`${tab}-${item.idx ?? item.scenarioId}`} 
              onClick={() => handleStart(item)}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #7C6CFF 0%, #4B3CF8 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(124,108,255,0.2)',
                  borderColor: 'rgba(124,108,255,0.3)',
                  transform: 'translateY(-4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .play-icon': {
                    opacity: 1,
                    transform: 'scale(1.1)'
                  }
                }
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  {/* 제목 */}
                  <Typography 
                    variant="h6" 
                    fontWeight={700} 
                    sx={{ 
                      fontSize: '1.0625rem',
                      lineHeight: 1.4,
                      color: '#212121'
                    }}
                  >
                    {item.title}
                  </Typography>

                  {/* 역할 정보 그리드 */}
                  <Stack spacing={1.5}>
                    {/* 나의 역할 */}
                    {item.myRole && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.125 }}>
                              나의 역할
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {item.myRole}
                            </Typography>
                          </Box>
                        </Box>
                        {item.isGrouped && item.groupType === 'overview' && (
                          <Chip
                            label="Overview"
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, rgba(124,108,255,0.15) 0%, rgba(75,60,248,0.1) 100%)',
                              color: 'primary.main',
                              border: '1px solid rgba(124,108,255,0.3)',
                              '& .MuiChip-label': {
                                px: 1.5
                              }
                            }}
                          />
                        )}
                        {item.isGrouped && item.groupType === 'detail' && (
                          <Chip
                            label="Detail"
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(56,142,60,0.1) 100%)',
                              color: '#4caf50',
                              border: '1px solid rgba(76,175,80,0.3)',
                              '& .MuiChip-label': {
                                px: 1.5
                              }
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* AI 역할 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToyIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.125 }}>
                          AI 역할
                        </Typography>
                        {item.isGrouped && item.groupType === 'detail' && item.availableAiRoles && item.availableAiRoles.length > 1 ? (
                          <FormControl size="small" sx={{ mt: 0.25, width: 'auto', minWidth: 120 }}>
                            <Select
                              value={selectedAiRoleIndices[item.scenarioId] ?? item.selectedAiRoleIndex ?? 0}
                              onChange={(e) => {
                                e.stopPropagation() // 카드 클릭 이벤트 방지
                                handleAiRoleChange(item.scenarioId, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 방지
                              sx={{
                                height: 32,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(124,108,255,0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.main',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.main',
                                },
                              }}
                            >
                              {item.availableAiRoles.map((role, idx) => (
                                <MenuItem key={idx} value={idx}>
                                  {role.aiRole}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                            {displayAiRole || 'AI 역할 미정'}
                        </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* 생성날짜 + 플레이 버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.6 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.125 }}>
                            생성날짜
                          </Typography>
                          <Typography variant="body2" fontWeight={500} color="text.secondary">
                            {item.createdAtLabel || item.date || '날짜 정보 없음'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* 플레이 버튼 아이콘 */}
                      <Box
                        className="play-icon"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                          color: 'white',
                          opacity: 0.7,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(124,108,255,0.3)',
                          flexShrink: 0
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 24, ml: 0.5 }} />
                      </Box>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            )
          })}
          {!error && filteredItems.length === 0 && (
            <Card 
              variant="outlined"
              sx={{
                borderRadius: 3,
                border: '1px dashed rgba(124,108,255,0.25)',
                background: 'linear-gradient(135deg, rgba(124,108,255,0.04) 0%, rgba(75,60,248,0.02) 100%)',
                boxShadow: '0 6px 18px rgba(124,108,255,0.12)'
              }}
            >
              <CardContent sx={{ py: 3, textAlign: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  표시할 시나리오가 없습니다
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </>
  )
}

export default memo(ScenarioList)
