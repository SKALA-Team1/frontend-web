import React from 'react'
import { Stack, Box, Typography, CircularProgress } from '@mui/material'
import useRoleplaySession from '../hooks/useRoleplaySession'
import useRoleplayFilters from '../hooks/useRoleplayFilters'
import useBookmarks from '../hooks/useBookmarks'
import ScenarioList from '../components/ScenarioList'
import SessionView from '../components/SessionView'
import SummaryView from '../components/SummaryView'
import FeedbackModal from '../components/FeedbackModal'
import EndSessionDialog from '../components/EndSessionDialog'
import CalendarDialog from '../components/CalendarDialog'
import SuggestionPanel from '../components/SuggestionPanel'

export default function RoleplayPage() {
  const [tab, setTab] = React.useState('linked')
  const [openCal, setOpenCal] = React.useState(false)
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [openPanel, setOpenPanel] = React.useState(false)
  const [openEnd, setOpenEnd] = React.useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false)
  const [pendingFeedbackScenario, setPendingFeedbackScenario] = React.useState(null)

  const session = useRoleplaySession()
  const filters = useRoleplayFilters(tab)
  const { bookmarked, toggleBookmark } = useBookmarks()

  const currentQuestion = React.useMemo(() => {
    const q = session.messages.find((m) => m.who === 'AI')
    return q ? q.text : session.selectedBody || ''
  }, [session.messages, session.selectedBody])

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

  return (
    <Stack spacing={2} sx={{ py: 2 }}>
      {session.view === 'list' && (
        <ScenarioList
          tab={tab}
          setTab={setTab}
          filteredItems={filters.filteredItems}
          filter={filters.filter}
          setFilter={filters.setFilter}
          onOpenCalendar={() => setOpenCal(true)}
          onStartRoleplay={session.startWithMic}
          onViewFeedback={handleViewFeedback}
        />
      )}

      <FeedbackModal
        open={feedbackModalOpen}
        onClose={closeFeedbackModal}
        onSelect={handleFeedbackHistorySelect}
      />

      {session.view === 'session' && session.isSession && (
        <SessionView
          selectedTitle={session.selectedTitle}
          messages={session.messages}
          bottomRef={session.bottomRef}
          onEndSession={() => setOpenEnd(true)}
          onOpenPanel={() => setOpenPanel(true)}
          isKeyboardMode={session.isKeyboardMode}
          onKeyboardToggle={session.toggleKeyboardMode}
          textInput={session.textInput}
          onTextInputChange={session.handleTextInputChange}
          onSendMessage={session.sendMessage}
          isRecording={session.isRecording}
          onMicClick={session.handleMicToggle}
          isTTSPlaying={session.isTTSPlaying}
          onAvatarLoad={session.handleAvatarLoad}
        />
      )}

      <SuggestionPanel
        open={openPanel}
        onClose={() => setOpenPanel(false)}
        currentQuestion={currentQuestion}
      />

      <EndSessionDialog
        open={openEnd}
        onClose={() => setOpenEnd(false)}
        onConfirm={() => {
          setOpenEnd(false)
          session.endSession()
        }}
      />

      {session.evaluating && (
        <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={56} thickness={4} />
          <Typography variant="body2" color="text.primary">분석 중...</Typography>
        </Box>
      )}

      {session.view === 'summary' && (
        <SummaryView
          summaryTab={session.summaryTab}
          setSummaryTab={session.setSummaryTab}
          messages={session.messages}
          bookmarked={bookmarked}
          toggleBookmark={toggleBookmark}
          scenarioTitle={session.selectedTitle}
          onClose={() => session.setView('list')}
        />
      )}

      <CalendarDialog
        open={openCal}
        onClose={() => setOpenCal(false)}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
    </Stack>
  )
}

