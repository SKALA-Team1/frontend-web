import React, { useState, useEffect } from 'react'
import { Stack, Typography, Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material'
import useHomePage from '../hooks/useHomePage'
import useHomeRoleplay from '../hooks/useHomeRoleplay'
import ProfileSummary from '../../user/components/ProfileSummary'
import RoleplayCTACard from '../components/RoleplayCTACard'
import CreateRoleplayDialog from '../components/CreateRoleplayDialog'
import RoleplayScenarioList from '../../roleplay/components/ScenarioList'
import SessionView from '../../roleplay/components/SessionView'
import SummaryView from '../../roleplay/components/SummaryView'
import EndSessionDialog from '../../roleplay/components/EndSessionDialog'
import CalendarDialog from '../../roleplay/components/CalendarDialog'
import SuggestionPanel from '../../roleplay/components/SuggestionPanel'

export default function HomePage() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')) // 900px 이상
  const drawerWidth = 280
  
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
  const {
    openCreate,
    aiRole,
    myRole,
    goal,
    handleOpenCreate,
    handleCloseCreate,
    handleAiRoleChange,
    handleMyRoleChange,
    handleGoalChange,
    handleStartRoleplay: handleStartRoleplayBase
  } = useHomePage()

  const {
    tab,
    setTab,
    openCal,
    setOpenCal,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    openPanel,
    setOpenPanel,
    openEnd,
    setOpenEnd,
    currentQuestion,
    session,
    filters,
    bookmarked,
    toggleBookmark,
    handleEndSession
  } = useHomeRoleplay()

  // 롤플레이 시작 핸들러 - 입력값을 조합해서 롤플레잉 시작
  const handleStartRoleplay = () => {
    if (!aiRole || !myRole || !goal) {
      alert('모든 필드를 입력해주세요.')
      return
    }
    
    const title = `${myRole} - ${aiRole}`
    const body = goal
    
    handleStartRoleplayBase()
    session.startWithMic(title, body)
  }


  // 롤플레잉 세션 화면
  if (session.view === 'session' && session.isSession) {
    return (
      <>
        <SessionView
          selectedTitle={session.selectedTitle}
          messages={session.messages}
          bottomRef={session.bottomRef}
          onEndSession={() => setOpenEnd(true)}
          onOpenPanel={() => setOpenPanel(true)}
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
        <SuggestionPanel
          open={openPanel}
          onClose={() => setOpenPanel(false)}
          currentQuestion={currentQuestion}
        />
        <EndSessionDialog
          open={openEnd}
          onClose={() => setOpenEnd(false)}
          onConfirm={handleEndSession}
        />
      </>
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
      <SummaryView
        summaryTab={session.summaryTab}
        setSummaryTab={session.setSummaryTab}
        messages={session.messages}
        bookmarked={bookmarked}
        toggleBookmark={toggleBookmark}
        scenarioTitle={session.selectedTitle}
        onClose={() => session.setView('list')}
      />
    )
  }

  // 기본 홈 화면
  return (
    <>
      <Stack spacing={2}>
        <ProfileSummary />

        <RoleplayScenarioList
          tab={tab}
          setTab={setTab}
          filteredItems={filters.filteredItems}
          filter={filters.filter}
          setFilter={filters.setFilter}
          onOpenCalendar={() => setOpenCal(true)}
          onStartRoleplay={session.startWithMic}
        />

        <CalendarDialog
          open={openCal}
          onClose={() => setOpenCal(false)}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <CreateRoleplayDialog
          open={openCreate}
          onClose={handleCloseCreate}
          aiRole={aiRole}
          myRole={myRole}
          goal={goal}
          onAiRoleChange={handleAiRoleChange}
          onMyRoleChange={handleMyRoleChange}
          onGoalChange={handleGoalChange}
          onStart={handleStartRoleplay}
        />
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
          maxWidth: { xs: '100%', sm: '600px' }, // 시나리오 카드와 동일한 최대 너비
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

