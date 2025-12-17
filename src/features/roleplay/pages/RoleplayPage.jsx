import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { Stack, Box, Typography, CircularProgress, useMediaQuery, useTheme, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Notification from '../../../components/Common/Notification'
import useCreateScenario from '../scenario-list/hooks/useCreateScenario'
import useSessionControls from '../session/hooks/useSessionControls'
import useScenarioData from '../scenario-list/hooks/useScenarioData'
import useRoleplayFilters from '../scenario-list/hooks/useRoleplayFilters'
import ProfileSummary from '../../user/components/ProfileSummary'
import RoleplayCTACard from '../scenario-list/components/RoleplayCTACard'
import ScenarioList from '../scenario-list/components/ScenarioList'
import LoadingSpinner from '../../../components/Common/LoadingSpinner'
import { UI } from '../../../config/constants'

// 무거운 컴포넌트들을 lazy load
const CreateRoleplayDialog = lazy(() => import('../scenario-list/components/CreateRoleplayDialog'))
const SessionView = lazy(() => import('../session/components/SessionView'))
const SummaryView = lazy(() => import('../summary/components/SummaryView'))
const EndSessionDialog = lazy(() => import('../session/components/EndSessionDialog'))
const CalendarDialog = lazy(() => import('../scenario-list/components/CalendarDialog'))

/**
 * 롤플레이 전체 페이지 (홈 통합)
 * - 시나리오 선택 → 세션 진행 → 요약/피드백까지 한 화면에서 전환
 * - 프로필 요약, 롤플레이 생성 다이얼로그 포함
 */
export default function RoleplayPage() {
  const { scenarios, loading: scenariosLoading, error: scenariosError, isSlackIntegrated, userJobRole, refresh } = useScenarioData()
  const [pendingSlackGeneration, setPendingSlackGeneration] = useState(false)
  const scenariosCountRef = React.useRef(scenarios.length)
  const pollTimerRef = React.useRef(null)
  const idleStreakRef = React.useRef(0)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')) // 900px 이상
  const drawerWidth = isDesktop ? UI.DRAWER_WIDTH_DESKTOP : UI.DRAWER_WIDTH_MOBILE

  // Slack 연동 완료 알림 상태
  const [slackConnectedToast, setSlackConnectedToast] = useState(false)

  // Slack OAuth 콜백 처리 (slack_connected=true 쿼리 파라미터 감지)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('slack_connected') === 'true') {
      setSlackConnectedToast(true)
      // URL에서 쿼리 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname)
      // 시나리오 목록 새로고침
      refresh()
      // Slack 채널 선택 후 시나리오 생성 중으로 표시
      setPendingSlackGeneration(true)
    }
  }, [refresh])

  // 스크롤 위치 감지
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치가 맨 위(50px 이하)인지 확인
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsAtTop(scrollTop <= 50)
    }

    // 초기 상태 확인
    handleScroll()

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 시나리오 자동 갱신 (채널 선택 후 일정 시간 폴링)
  useEffect(() => {
    // 이전보다 시나리오가 늘었으면 idle 카운터 리셋 (폴링은 유지)
    const prev = scenariosCountRef.current
    scenariosCountRef.current = scenarios.length
    if (pendingSlackGeneration && scenarios.length > prev) {
      idleStreakRef.current = 0
    }
  }, [scenarios.length, pendingSlackGeneration])

  useEffect(() => {
    if (!pendingSlackGeneration) return

    const intervalMs = 3000
    const maxAttempts = 100 // 최대 약 5분
    const idleLimit = 20    // 변화 없는 60초(20회) 후 종료

    let attempts = 0
    pollTimerRef.current = setInterval(() => {
      attempts += 1
      idleStreakRef.current += 1
      refresh({ silent: true })

      if (idleStreakRef.current >= idleLimit || attempts >= maxAttempts) {
        setPendingSlackGeneration(false)
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current)
          pollTimerRef.current = null
        }
      }
    }, intervalMs)

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
      idleStreakRef.current = 0
    }
  }, [pendingSlackGeneration, refresh])

  // 롤플레잉 종료 확인 모달 상태
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false)

  // 롤플레이 세션 관련 (먼저 초기화하여 session을 useCreateScenario에서 사용 가능하도록)
  const {
    tab,
    setTab,
    openCal,
    setOpenCal,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    openEnd,
    setOpenEnd,
    currentQuestion,
    session,
    // bookmarked,
    // toggleBookmark,
    handleEndSession
  } = useSessionControls(scenarios, {
    onSessionEnded: () => {
      // 세션 종료 시 모달 표시
      setShowSessionEndedModal(true)
    }
  })

  // 롤플레이 생성 다이얼로그 관련 (session이 초기화된 후 호출)
  const {
    openCreate,
    aiRole,
    myRole,
    situation,
    createLoading,
    createError,
    creationToast,
    clearCreationToast,
    handleOpenCreate,
    handleCloseCreate,
    handleAiRoleChange,
    handleMyRoleChange,
    handleSituationChange,
    handleStartRoleplay: handleCreateScenario,
    openStartConfirm,
    createdScenario,
    handleConfirmStartRoleplay,
    handleCancelStartRoleplay
  } = useCreateScenario(scenarios, { 
    onScenarioCreated: refresh,
    onStartRoleplay: session.startWithMic
  })

  // 시나리오 필터링 (메모이제이션)
  const { filteredItems } = useRoleplayFilters(tab, scenarios, startDate, endDate)
  
  // 핸들러 메모이제이션
  const handleOpenCalendarMemo = useMemo(() => () => setOpenCal(true), [setOpenCal])

  // 피드백 모달 관련
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [pendingFeedbackScenario, setPendingFeedbackScenario] = useState(null)

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false)
    setPendingFeedbackScenario(null)
  }

  const handleFeedbackHistorySelect = () => {
    if (!pendingFeedbackScenario) return
    session.handleFeedbackView(pendingFeedbackScenario.title, pendingFeedbackScenario.body)
    closeFeedbackModal()
  }

  const handleViewFeedback = (item) => {
    setPendingFeedbackScenario(item)
    setFeedbackModalOpen(true)
  }

  // 롤플레잉 세션 화면 (isSession이 false여도 view가 'session'이면 표시)
  if (session.view === 'session') {
    return (
      <Suspense fallback={<LoadingSpinner message="세션 로딩 중..." />}>
        <SessionView
          selectedTitle={session.selectedTitle}
          messages={session.messages}
          bottomRef={session.bottomRef}
          onEndSession={() => setOpenEnd(true)}
          onMicClick={session.handleMicToggle}
          isRecording={session.isRecording}
          isKeyboardMode={session.isKeyboardMode}
          onKeyboardToggle={session.toggleKeyboardMode}
          textInput={session.textInput}
          onTextInputChange={session.handleTextInputChange}
          onSendMessage={session.sendMessage}
          isTTSPlaying={session.isTTSPlaying}
          onAvatarLoad={session.handleAvatarLoad}
          visemeQueue={session.visemeQueue}
          audioRef={session.audioRef}
          onFetchKeywords={session.handleFetchKeywords}
          aiRole={session.selectedAiRole}
        />
        {openEnd && (
          <Suspense fallback={null}>
            <EndSessionDialog
              open={openEnd}
              onClose={() => setOpenEnd(false)}
              onConfirm={handleEndSession}
            />
          </Suspense>
        )}
      </Suspense>
    )
  }

  // 분석 중 화면
  if (session.evaluating) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2
        }}
      >
          <CircularProgress size={56} thickness={4} />
        <Typography variant="body2" color="text.primary">
          분석 중...
        </Typography>
        </Box>
    )
  }

  // 피드백 요약 화면
  if (session.view === 'summary') {
    return (
      <Suspense fallback={<LoadingSpinner message="요약 로딩 중..." />}>
        <SummaryView
          messages={session.messages}
          scenarioTitle={session.selectedTitle}
          sessionId={session.sessionInfo?.sessionId || session.sessionInfo?.session_id}
          onClose={() => session.setView('list')}
        />
      </Suspense>
    )
  }

  // 기본 홈 화면 (시나리오 목록)
  return (
    <>
      {/* Slack 연동 완료 토스트 알림 (로그인 성공 토스트와 같은 위치) */}
      <Notification
        open={slackConnectedToast}
        message="Slack 연동이 완료되었습니다! 채널을 선택하여 시나리오를 생성하세요."
        severity="success"
        onClose={() => setSlackConnectedToast(false)}
        autoHideDuration={3000}
      />

      <Stack spacing={2} sx={{  px: { xs: 0, sm: 0 } }}>
        {creationToast && (
          <Alert
            severity="success"
            sx={{ mb: 1 }}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={clearCreationToast}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {creationToast}
          </Alert>
        )}

        <ProfileSummary />

        <ScenarioList
          tab={tab}
          setTab={setTab}
          filteredItems={filteredItems}
          totalScenarios={scenarios.length}
          isSlackIntegrated={isSlackIntegrated}
          pendingSlackGeneration={pendingSlackGeneration}
          onChannelSelected={() => setPendingSlackGeneration(true)}
          userJobRole={userJobRole}
          loading={scenariosLoading}
          error={scenariosError}
          onRetry={refresh}
          onOpenCalendar={handleOpenCalendarMemo}
          onStartRoleplay={session.startWithMic}
          onViewFeedback={handleViewFeedback}
          startDate={startDate}
          endDate={endDate}
        />

        {openCal && (
          <Suspense fallback={null}>
            <CalendarDialog
              open={openCal}
              onClose={() => setOpenCal(false)}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </Suspense>
        )}

        {openCreate && (
          <Suspense fallback={null}>
            <CreateRoleplayDialog
              open={openCreate}
              onClose={handleCloseCreate}
              aiRole={aiRole}
              myRole={myRole}
              situation={situation}
              onAiRoleChange={handleAiRoleChange}
              onMyRoleChange={handleMyRoleChange}
              onSituationChange={handleSituationChange}
              onStart={handleCreateScenario}
              loading={createLoading}
              errorMessage={createError}
            />
          </Suspense>
        )}

        {/* 과거 피드백 선택 모달 - TODO: FeedbackModal 컴포넌트 구현 필요 */}
        {/* <FeedbackModal
          open={feedbackModalOpen}
          onClose={closeFeedbackModal}
          onSelect={handleFeedbackHistorySelect}
        /> */}

        {/* 롤플레잉 시작 확인 다이얼로그 */}
        <Dialog
          open={openStartConfirm}
          onClose={handleCancelStartRoleplay}
          aria-labelledby="start-roleplay-dialog-title"
          aria-describedby="start-roleplay-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            id="start-roleplay-dialog-title"
            sx={{ 
              fontWeight: 700,
              fontSize: '1.25rem',
              pb: 1
            }}
          >
            롤플레잉을 실행할까요?
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="start-roleplay-dialog-description"
              sx={{ 
                fontSize: '0.9375rem',
                color: 'text.primary',
                mb: 1
              }}
            >
              시나리오가 성공적으로 생성되었습니다.
            </DialogContentText>
            {createdScenario && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(124,108,255,0.05)', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                  {createdScenario.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {createdScenario.body}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button 
              onClick={handleCancelStartRoleplay}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              아니오
            </Button>
            <Button 
              onClick={handleConfirmStartRoleplay}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
                }
              }}
            >
              예
            </Button>
          </DialogActions>
        </Dialog>

        {/* 롤플레잉 종료 확인 모달 */}
        <Dialog
          open={showSessionEndedModal}
          onClose={() => setShowSessionEndedModal(false)}
          aria-labelledby="session-ended-dialog-title"
          aria-describedby="session-ended-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            id="session-ended-dialog-title"
            sx={{ 
              fontWeight: 700,
              fontSize: '1.25rem',
              pb: 1
            }}
          >
            롤플레잉이 종료되었습니다
          </DialogTitle>
          <DialogContent>
            <DialogContentText 
              id="session-ended-dialog-description"
              sx={{ 
                fontSize: '0.9375rem',
                color: 'text.primary',
                mb: 1
              }}
            >
              피드백을 보시겠습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button 
              onClick={() => setShowSessionEndedModal(false)}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              아니오
            </Button>
            <Button 
              onClick={() => {
                setShowSessionEndedModal(false)
                // 피드백 화면으로 이동 (SummaryView가 로딩 처리를 함)
                session.handleFeedbackView(session.selectedTitle, session.selectedBody)
              }}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)',
                }
              }}
            >
              예
            </Button>
          </DialogActions>
        </Dialog>
    </Stack>

      {/* 고정 버튼: 스크롤이 맨 위에 있을 때만 표시 */}
      {/* Slack 시나리오가 있을 때는 CTA 카드 숨기기 */}
      {!filteredItems.some(item => item.creationType === 'SLACK') && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: isDesktop ? `${drawerWidth}px` : 0,
            right: 0,
            zIndex: 1000,
            px: { xs: 2.5, sm: 3 },
            pb: 4,
            pt: 1,
            pointerEvents: isAtTop ? 'auto' : 'none',
            opacity: isAtTop ? 1 : 0,
            transform: isAtTop ? 'translateY(0)' : 'translateY(100%)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            maxWidth: { xs: '100%', sm: '600px' },
            mx: 'auto',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <RoleplayCTACard onClick={handleOpenCreate} />
        </Box>
      )}
    </>
  )
}
