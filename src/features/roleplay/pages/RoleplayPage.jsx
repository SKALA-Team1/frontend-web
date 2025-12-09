import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { Stack, Box, Typography, CircularProgress, useMediaQuery, useTheme, Alert, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')) // 900px 이상
  const drawerWidth = isDesktop ? UI.DRAWER_WIDTH_DESKTOP : UI.DRAWER_WIDTH_MOBILE
  
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

  // 롤플레이 생성 다이얼로그 관련
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
    handleStartRoleplay: handleCreateScenario
  } = useCreateScenario(scenarios, { onScenarioCreated: refresh })

  // 롤플레이 세션 관련
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
    bookmarked,
    toggleBookmark,
    handleEndSession
  } = useSessionControls(scenarios)

  // 시나리오 필터링 (메모이제이션)
  const { filteredItems } = useRoleplayFilters(tab, scenarios)
  
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

  // 롤플레잉 세션 화면
  if (session.view === 'session' && session.isSession) {
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
          onClose={() => session.setView('list')}
        />
      </Suspense>
    )
  }

  // 기본 홈 화면 (시나리오 목록)
  return (
    <>
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
          isSlackIntegrated={isSlackIntegrated}
          userJobRole={userJobRole}
          loading={scenariosLoading}
          error={scenariosError}
          onRetry={refresh}
          onOpenCalendar={handleOpenCalendarMemo}
          onStartRoleplay={session.startWithMic}
          onViewFeedback={handleViewFeedback}
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
    </Stack>

      {/* 고정 버튼: 스크롤이 맨 위에 있을 때만 표시 */}
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
    </>
  )
}
