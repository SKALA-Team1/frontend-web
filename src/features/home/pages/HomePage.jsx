import React from 'react'
import { Stack, Typography, Box, CircularProgress } from '@mui/material'
import useHomePage from '../hooks/useHomePage'
import useHomeRoleplay from '../hooks/useHomeRoleplay'
import GreetingSection from '../components/GreetingSection'
import SummaryCard from '../components/SummaryCard'
import RoleplayCTACard from '../components/RoleplayCTACard'
import CreateRoleplayDialog from '../components/CreateRoleplayDialog'
import RoleplayScenarioList from '../../roleplay/components/ScenarioList'
import SessionView from '../../roleplay/components/SessionView'
import SummaryView from '../../roleplay/components/SummaryView'
import EndSessionDialog from '../../roleplay/components/EndSessionDialog'
import CalendarDialog from '../../roleplay/components/CalendarDialog'
import SuggestionPanel from '../../roleplay/components/SuggestionPanel'

export default function HomePage() {
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
        onClose={() => session.setView('list')}
      />
    )
  }

  // 기본 홈 화면
  return (
    <Stack spacing={2}>
      <GreetingSection />
      <SummaryCard />
      <RoleplayCTACard onClick={handleOpenCreate} />

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
  )
}


