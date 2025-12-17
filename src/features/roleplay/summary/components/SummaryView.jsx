import React, { useState, useEffect, useMemo } from 'react'
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
  Collapse,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TranslateIcon from '@mui/icons-material/Translate'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { getComprehensiveFeedback, getSessionUtterances } from '../../../../services/roleplayService'
import { createBookmark, getMyBookmarks } from '../../../../services/bookmarkService'
import LoadingSpinner from '../../../../components/Common/LoadingSpinner'

const normalizeConversationMessages = (rawMessages = []) => {
  if (!Array.isArray(rawMessages)) return []
  
  // 1. 기본 필터링 및 정규화
  const normalized = rawMessages
    .filter((msg) => {
      const who = msg?.who
      const text = typeof msg?.text === 'string' ? msg.text.trim() : ''
      return (who === 'AI' || who === 'You' || who === 'USER') && text.length > 0
    })
    .map((msg) => ({
      ...msg,
      who: msg.who === 'USER' ? 'You' : msg.who,
      text: msg.text.trim()
    }))
  
  // 2. 중복된 AI 질문 제거 (재시도로 인한 중복 제거)
  // 바로 이전 메시지가 AI이고 현재 메시지도 AI이며 텍스트가 같으면 현재 메시지를 제거
  const filtered = []
  
  for (let i = 0; i < normalized.length; i++) {
    const currentMsg = normalized[i]
    const prevMsg = i > 0 ? normalized[i - 1] : null
    
    // 현재 메시지가 AI이고, 이전 메시지도 AI이며, 텍스트가 같으면 제거 (중복된 재시도 질문)
    if (
      currentMsg.who === 'AI' &&
      prevMsg &&
      prevMsg.who === 'AI' &&
      currentMsg.text === prevMsg.text
    ) {
      continue // 중복된 AI 질문 제거
    }
    
    // 그 외의 경우는 모두 포함
    filtered.push(currentMsg)
  }
  
  return filtered
}

export default function SummaryView({
  messages,
  onClose,
  scenarioTitle = '롤플레이 시나리오',
  sessionId = null
}) {
  const [isConversationOpen, setIsConversationOpen] = React.useState(true)
  const [isLongOpen, setIsLongOpen] = React.useState(true) // 기본적으로 긴 피드백을 열어서 보여줌
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true) // 초기 로딩 상태를 true로 설정하여 피드백 조회 전부터 LoadingSpinner 표시
  const [error, setError] = useState(null)
  const [bookmarkedMessages, setBookmarkedMessages] = useState({})
  const [messageIdMap, setMessageIdMap] = useState({}) // utterance_index -> messageId 매핑
  const [pendingBookmarks, setPendingBookmarks] = useState(new Set()) // 선택된 북마크 messageId들 (닫기 버튼에서 저장)
  const [savedBookmarkIds, setSavedBookmarkIds] = useState(new Set()) // 이미 저장된 북마크 messageId들
  const [savingBookmarks, setSavingBookmarks] = useState(false) // 북마크 저장 중 상태
  const [utterances, setUtterances] = useState([]) // utterances 데이터 (피드백 포함)
  const [expandedFeedback, setExpandedFeedback] = useState({}) // 피드백 토글 상태 (messageId -> boolean)
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false) // 북마크 저장 확인 다이얼로그 상태
  const [loadedMessages, setLoadedMessages] = useState([]) // SummaryView 내부에서 로드한 messages

  // messages prop이 있으면 사용하고, 없으면 내부에서 로드한 messages 사용
  const messagesToUse = messages && messages.length > 0 ? messages : loadedMessages

  // messages를 메모이제이션하여 불필요한 재계산 방지
  const normalizedMessages = useMemo(() => {
    console.log('[SummaryView] messagesToUse:', messagesToUse)
    const normalized = normalizeConversationMessages(messagesToUse)
    console.log('[SummaryView] normalizedMessages:', normalized)
    return normalized
  }, [messagesToUse])
  const displayMessages = useMemo(() => {
    const display = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION
    console.log('[SummaryView] displayMessages:', display, 'isMOCK:', display === MOCK_CONVERSATION)
    return display
  }, [normalizedMessages])

  // utterances 가져와서 messageId 매핑 및 messages 로드 (피드백이 준비된 후에만 실행)
  const loadUtterances = React.useCallback(async () => {
    if (!sessionId) return

    try {
      console.log('[SummaryView] utterances 로드 시작, sessionId:', sessionId)
      const utterancesData = await getSessionUtterances(sessionId)
      const utterances = utterancesData?.utterances || []
      console.log('[SummaryView] utterances 로드 완료, length:', utterances.length)
      
      // utterances를 messages 형식으로 변환
      const messages = utterances.map(utterance => ({
        who: utterance.speaker === 'user' ? 'You' : 'AI',
        text: utterance.text || '',
        translation: utterance.question_ko || null
      }))
      console.log('[SummaryView] 변환된 messages:', messages)
      setLoadedMessages(messages)
      
      // utterances를 turn_index 순서로 정렬
      const sortedUtterances = [...utterances].sort((a, b) => 
        (a.utterance_index || 0) - (b.utterance_index || 0)
      )
      
      // displayMessages의 인덱스와 utterances의 turn_index를 매칭
      // displayMessages는 AI와 User가 번갈아 나오므로, turn_index로 직접 매칭 불가
      // 대신 텍스트 매칭으로 user 메시지의 messageId 찾기
      const idMap = {}
      // messagesToUse를 직접 정규화하여 사용
      const currentNormalizedMessages = normalizeConversationMessages(messages)
      const currentDisplayMessages = currentNormalizedMessages.length > 0 ? currentNormalizedMessages : MOCK_CONVERSATION
      
      sortedUtterances.forEach(utterance => {
        if ((utterance.speaker === 'user' || utterance.speaker === 'USER') && utterance.id) {
          // currentDisplayMessages에서 같은 텍스트를 가진 사용자 메시지 찾기
          currentDisplayMessages.forEach((msg, idx) => {
            if (msg.who === 'You' && msg.text && utterance.text) {
              const msgText = msg.text.trim()
              const utteranceText = utterance.text.trim()
              if (msgText === utteranceText) {
                idMap[idx] = utterance.id
              }
            }
          })
        }
      })
      
      setMessageIdMap(idMap)
      setUtterances(sortedUtterances) // utterances 데이터 저장
      
      // 북마크 불러오기
      try {
        const bookmarks = await getMyBookmarks()
        if (!bookmarks || !Array.isArray(bookmarks)) return
        
        // 현재 세션의 북마크만 필터링
        const sessionBookmarks = bookmarks.filter(bookmark => {
          const bookmarkSessionId = bookmark.sessionId || bookmark.session_id
          return bookmarkSessionId && (bookmarkSessionId.toString() === sessionId?.toString())
        })
        
        // 북마크된 messageId들을 Set으로 만들기
        const bookmarkedMessageIds = new Set(
          sessionBookmarks
            .map(bookmark => bookmark.messageId || bookmark.message_id)
            .filter(id => id != null)
        )
        
        // 이미 저장된 북마크 ID 추적
        setSavedBookmarkIds(bookmarkedMessageIds)
        
        // 북마크된 messageId들을 pendingBookmarks에 추가 (이미 저장된 북마크도 UI에 표시하기 위해)
        setPendingBookmarks(bookmarkedMessageIds)
      } catch (err) {
        console.error('[SummaryView] Failed to load bookmarks:', err)
      }
    } catch (err) {
      console.error('[SummaryView] Failed to load utterances:', err)
    }
  }, [sessionId])
  
  // messageIdMap과 북마크를 매칭하여 bookmarkedMessages 업데이트
  useEffect(() => {
    if (Object.keys(messageIdMap).length === 0) return
    
    const bookmarked = {}
    Object.entries(messageIdMap).forEach(([idx, messageId]) => {
      if (pendingBookmarks.has(messageId)) {
        const messageKey = `You-${idx}`
        bookmarked[messageKey] = true
      }
    })
    
    // bookmarkedMessages 업데이트 (기존 것과 병합)
    setBookmarkedMessages(prev => ({ ...prev, ...bookmarked }))
  }, [messageIdMap, pendingBookmarks])

  // 종합 피드백 조회 (피드백 생성 완료까지 대기)
  useEffect(() => {
    if (!sessionId) {
      console.warn('[SummaryView] sessionId가 없어 피드백을 조회할 수 없습니다.')
      return
    }

    let pollCount = 0
    const MAX_POLLS = 20 // 최대 20번 폴링 (약 40초)
    const POLL_INTERVAL = 2000 // 2초마다 조회

    const pollFeedback = async () => {
      setLoading(true)
      setError(null)
      
      const tryPoll = async () => {
        try {
          const feedbackData = await getComprehensiveFeedback(sessionId)
          console.log('[SummaryView] 피드백 응답 데이터:', feedbackData)
          console.log('[SummaryView] 피드백 필드 확인:', {
            success: feedbackData?.success,
            avgPronunciation: feedbackData?.avgPronunciation,
            avgPronunciaition: feedbackData?.avgPronunciaition,
            avgGrammar: feedbackData?.avgGrammar,
            avgRelevance: feedbackData?.avgRelevance,
            feedbackShort: feedbackData?.feedbackShort,
            feedback_short: feedbackData?.feedback_short,
            feedbackLong: feedbackData?.feedbackLong,
            feedback_long: feedbackData?.feedback_long
          })
          
          // success가 false인 경우에만 에러 처리
          // success가 undefined/null이거나 true인 경우 정상 응답으로 처리
          if (feedbackData?.success === false) {
            console.warn('[SummaryView] 피드백 조회 실패 응답 (success=false):', feedbackData)
            setError('피드백이 아직 생성되지 않았습니다.')
            setFeedback(null)
          } else {
            // success가 true이거나 undefined/null인 경우 모두 정상 응답으로 처리
            console.log('[SummaryView] 피드백 조회 성공, 피드백 설정:', feedbackData)
            setFeedback(feedbackData)
            // 피드백이 성공적으로 로드되면 utterances도 로드
            loadUtterances()
          }
          setLoading(false)
        } catch (err) {
          // 404 에러면 피드백이 아직 생성 중이므로 계속 폴링
          if (err.response?.status === 404 && pollCount < MAX_POLLS) {
            pollCount++
            setTimeout(tryPoll, POLL_INTERVAL)
          } else {
            console.error('[SummaryView] 피드백 조회 실패:', err)
            // 404이고 폴링이 끝났다면 피드백이 없다는 것을 명확히 표시
            if (err.response?.status === 404) {
              setError('피드백이 아직 생성되지 않았습니다.')
            } else {
              setError('피드백을 불러오는 중 오류가 발생했습니다.')
            }
            setLoading(false)
          }
        }
      }

      tryPoll()
    }

    pollFeedback()
  }, [sessionId])

  // 피드백 데이터 (API 응답 또는 기본값)
  const avgPronunciation = feedback?.avgPronunciation ?? feedback?.avgPronunciaition ?? feedback?.avg_pronunciation ?? feedback?.avg_pronunciaition ?? null
  const avgGrammar = feedback?.avgGrammar ?? feedback?.avg_grammar ?? null
  const avgRelevance = feedback?.avgRelevance ?? feedback?.avg_relevance ?? null
  const shortFeedback = feedback?.feedbackShort ?? feedback?.feedback_short ?? ''
  const longFeedback = feedback?.feedbackLong ?? feedback?.feedback_long ?? ''

  // 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <Box sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 0, sm: 0 }, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner/>
      </Box>
    )
  }

  // 에러가 있으면 에러 메시지만 표시하고, 대화 내용은 그 아래 표시 (피드백이 없어도 대화 내용은 보여줌)

  return (
    <Box sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 0, sm: 0 } }}>
      <Stack spacing={1.5}>
        {/* 헤더 */}
        <Stack spacing={0.25} alignItems="center" textAlign="center">
          <Typography variant="overline" sx={{ letterSpacing: 1.2, color: 'text.secondary' }}>
            롤플레이 종합 피드백
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {scenarioTitle || '롤플레이 시나리오'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            짧은 요약과 상세 피드백을 확인하고 대화 로그를 복기하세요.
          </Typography>
        </Stack>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="warning" sx={{ mb: 0.5 }}>
            {error}
          </Alert>
        )}

        {/* 종합 피드백 (피드백이 있을 때만 표시) */}
        {feedback && (
        <Card
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              border: '1px solid rgba(124,108,255,0.2)',
              background: 'linear-gradient(135deg, rgba(124,108,255,0.04) 0%, rgba(75,60,248,0.02) 100%)',
              boxShadow: '0 8px 24px rgba(124,108,255,0.12)'
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* 점수 표시 */}
              {(avgPronunciation !== null || avgGrammar !== null || avgRelevance !== null) && (
                <>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      평균 점수
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {avgPronunciation !== null && (
                        <Chip
                          label={`발음: ${avgPronunciation}점`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124,108,255,0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                      {avgGrammar !== null && (
                        <Chip
                          label={`문법: ${avgGrammar}점`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124,108,255,0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                      {avgRelevance !== null && (
                        <Chip
                          label={`문맥: ${avgRelevance}점`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(124,108,255,0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* 짧은 피드백 */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  짧은 버전
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {shortFeedback}
                </Typography>
              </Box>

              <Divider />

              {/* 긴 피드백 */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  긴 버전
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                  {longFeedback}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* 대화 로그 */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 0.5,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.03)'
              }
            }}
            onClick={() => setIsConversationOpen((prev) => !prev)}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              대화 로그
            </Typography>
            <IconButton
              size="small"
              sx={{
                color: 'text.primary',
                transition: 'transform 0.2s ease',
                transform: isConversationOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>

          <Collapse in={isConversationOpen} timeout="auto" unmountOnExit>
            <Stack spacing={0.75}>
              {displayMessages.map((msg, idx) => {
                const isUser = msg.who === 'You'
                const messageKey = `${msg.who}-${idx}`
                const messageId = messageIdMap[idx]
                const isBookmarked = bookmarkedMessages[messageKey] || (messageId && pendingBookmarks.has(messageId))
                
                // 사용자 발화인 경우 utterances에서 피드백 데이터 찾기
                const userUtterance = isUser && messageId 
                  ? utterances.find(u => u.id === messageId && (u.speaker === 'user' || u.speaker === 'USER'))
                  : null
                
                const hasFeedback = userUtterance && (
                  userUtterance.pronunciation_score !== null || 
                  userUtterance.grammar_score !== null || 
                  userUtterance.relevance_score !== null ||
                  (userUtterance.feedback_sections && userUtterance.feedback_sections.length > 0)
                )
                const isFeedbackExpanded = expandedFeedback[messageId] || false
                
                return (
                  <Box key={messageKey} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={isUser ? 'flex-end' : 'flex-start'}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: isUser ? 'primary.main' : 'text.primary',
                          textTransform: 'uppercase'
                        }}
                      >
                        {isUser ? 'You' : 'AI'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{idx + 1}
                      </Typography>
                      {isUser && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            const utteranceIndex = idx
                            const messageId = messageIdMap[utteranceIndex]
                            
                            if (!messageId) {
                              return
                            }

                            // 로컬 상태만 변경 (즉시 DB 저장하지 않음)
                            setPendingBookmarks(prev => {
                              const newSet = new Set(prev)
                              if (newSet.has(messageId)) {
                                newSet.delete(messageId)
                                setBookmarkedMessages(prevMsgs => ({
                                  ...prevMsgs,
                                  [messageKey]: false
                                }))
                              } else {
                                newSet.add(messageId)
                                setBookmarkedMessages(prevMsgs => ({
                                  ...prevMsgs,
                                  [messageKey]: true
                                }))
                              }
                              return newSet
                            })
                          }}
                          disabled={!messageIdMap[idx] || savingBookmarks}
                          sx={{
                            padding: 0.25,
                            minWidth: 'auto',
                            width: 20,
                            height: 20,
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          <BookmarkIcon 
                            sx={{ 
                              fontSize: 16,
                              color: isBookmarked ? '#FFA500' : 'rgba(0,0,0,0.4)',
                              transition: 'color 0.2s ease'
                            }} 
                          />
                        </IconButton>
                      )}
                    </Stack>
                    <Card
                      variant="outlined"
                      sx={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        bgcolor: isUser ? 'rgba(124,108,255,0.08)' : 'rgba(0,0,0,0.03)',
                        border: isUser ? '1px solid rgba(124,108,255,0.25)' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 1,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                      }}
                    >
                      <CardContent sx={{ pt: 1.5, px: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.text}
                        </Typography>
                        {msg.translation && (
                          <>
                            <Divider sx={{ my: 0.5 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {msg.translation}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* 사용자 발화 밑에 피드백 점수 및 내용 */}
                    {isUser && hasFeedback && (
                      <Box sx={{ alignSelf: 'flex-end', maxWidth: '88%', mt: 0.25 }}>
                        {/* 토글 버튼은 왼쪽, 점수는 오른쪽 정렬로 배치 */}
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          justifyContent="space-between" 
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          {/* 피드백 내용이 있는 경우에만 토글 버튼 표시 (왼쪽) */}
                          {(() => {
                            const feedbackSections = userUtterance?.feedback_sections || userUtterance?.feedbackSections
                            const hasFeedbackContent = feedbackSections && Array.isArray(feedbackSections) && feedbackSections.length > 0 && 
                              feedbackSections.some(section => {
                                const feedbackKo = section.feedback_ko || section.feedbackKo
                                const feedbackEn = section.feedback_en || section.feedbackEn
                                return feedbackKo || feedbackEn
                              })
                            
                            if (!hasFeedbackContent) {
                              return <Box /> // 공간 유지를 위한 빈 Box
                            }
                            
                            return (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                  setExpandedFeedback(prev => ({
                                    ...prev,
                                    [messageId]: !prev[messageId]
                                  }))
                                }}
                                endIcon={
                                  <ExpandMoreIcon 
                                    sx={{ 
                                      transform: isFeedbackExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s ease'
                                    }} 
                                  />
                                }
                                sx={{
                                  textTransform: 'none',
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1
                                }}
                              >
                                피드백 보기
                              </Button>
                            )
                          })()}
                          
                          {/* 점수는 기본으로 항상 표시 (오른쪽 끝에 붙임) */}
                          {(userUtterance.pronunciation_score !== null || 
                            userUtterance.grammar_score !== null || 
                            userUtterance.relevance_score !== null) && (
                            <Stack direction="row" spacing={1} gap={1} flexWrap="wrap" justifyContent="flex-end">
                              {userUtterance.pronunciation_score !== null && (
                                <Chip
                                  label={`발음: ${userUtterance.pronunciation_score}점`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(124,108,255,0.1)',
                                    color: 'primary.main',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                              {userUtterance.grammar_score !== null && (
                                <Chip
                                  label={`문법: ${userUtterance.grammar_score}점`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(124,108,255,0.1)',
                                    color: 'primary.main',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                              {userUtterance.relevance_score !== null && (
                                <Chip
                                  label={`문맥: ${userUtterance.relevance_score}점`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(124,108,255,0.1)',
                                    color: 'primary.main',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>
                        
                        {/* 피드백 내용 (Collapse로 펼치기/접기) */}
                        {(() => {
                          const feedbackSections = userUtterance?.feedback_sections || userUtterance?.feedbackSections
                          const hasFeedbackContent = feedbackSections && Array.isArray(feedbackSections) && feedbackSections.length > 0 && 
                            feedbackSections.some(section => {
                              const feedbackKo = section.feedback_ko || section.feedbackKo
                              const feedbackEn = section.feedback_en || section.feedbackEn
                              return feedbackKo || feedbackEn
                            })
                          
                          if (!hasFeedbackContent) {
                            return null
                          }
                          
                          return (
                            <Collapse in={isFeedbackExpanded} timeout="auto">
                              <Card
                                variant="outlined"
                                sx={{
                                  mt: 0.5,
                                  bgcolor: 'rgba(124,108,255,0.04)',
                                  border: '1px solid rgba(124,108,255,0.15)',
                                  borderRadius: 1
                                }}
                              >
                                <CardContent sx={{ py: 0.75, px: 1 }}>
                                  {/* 피드백 섹션 표시 (롤플레잉 도중 채팅과 동일한 형식) */}
                                  {(() => {
                                    const feedbackTypeLabels = {
                                      pronunciation: '발음',
                                      grammar: '문법',
                                      relevance: '문맥'
                                    }
                                    
                                    return (
                                      <Stack spacing={0.75}>
                                        {feedbackSections.map((section, sectionIdx) => {
                                          // 필드명 변형 지원 (snake_case, camelCase)
                                          const feedbackKo = section.feedback_ko || section.feedbackKo
                                          const feedbackEn = section.feedback_en || section.feedbackEn
                                          // 롤플레잉 도중과 동일하게 한글 우선, 없으면 영문
                                          const feedbackText = feedbackKo || feedbackEn
                                          const score = section.score !== null && section.score !== undefined ? section.score : null
                                          
                                          // 피드백 텍스트가 없는 섹션은 표시하지 않음
                                          if (!feedbackText) {
                                            return null
                                          }
                                          
                                          return (
                                            <Box key={sectionIdx}>
                                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    color: '#7C6CFF'
                                                  }}
                                                >
                                                  {feedbackTypeLabels[section.type] || section.type}
                                                </Typography>
                                                {score !== null && score !== undefined && (
                                                  <Chip
                                                    label={`${score}점`}
                                                    size="small"
                                                    sx={{
                                                      height: 20,
                                                      fontSize: '0.65rem',
                                                      bgcolor: 'rgba(124,108,255,0.1)',
                                                      color: '#7C6CFF',
                                                      fontWeight: 600,
                                                      border: '1px solid rgba(124,108,255,0.2)',
                                                      '& .MuiChip-label': {
                                                        px: 0.75,
                                                        py: 0
                                                      }
                                                    }}
                                                  />
                                                )}
                                              </Stack>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  lineHeight: 1.6,
                                                  wordBreak: 'break-word',
                                                  fontSize: '0.75rem',
                                                  color: '#212121'
                                                }}
                                              >
                                                {feedbackText}
                                              </Typography>
                                              {sectionIdx < feedbackSections.length - 1 && <Divider sx={{ mt: 0.75 }} />}
                                            </Box>
                                          )
                                        })}
                                      </Stack>
                                    )
                                  })()}
                                </CardContent>
                              </Card>
                            </Collapse>
                          )
                        })()}
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Stack>
          </Collapse>
        </Box>

        <Button 
          variant="outlined" 
          onClick={() => {
            // 새로 추가된 북마크가 있으면 확인 모달 표시, 없으면 바로 닫기
            const newBookmarkCount = Array.from(pendingBookmarks).filter(id => !savedBookmarkIds.has(id)).length
            if (newBookmarkCount > 0) {
              setShowSaveConfirmDialog(true)
            } else {
              onClose()
            }
          }}
          disabled={savingBookmarks}
          sx={{ mt: 1 }}
        >
          {savingBookmarks ? '저장 중...' : Array.from(pendingBookmarks).filter(id => !savedBookmarkIds.has(id)).length > 0 ? `저장` : '닫기'}
        </Button>

        {/* 북마크 저장 확인 다이얼로그 */}
        <Dialog
          open={showSaveConfirmDialog}
          onClose={() => setShowSaveConfirmDialog(false)}
          aria-labelledby="save-bookmarks-dialog-title"
          aria-describedby="save-bookmarks-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="save-bookmarks-dialog-title" sx={{ fontWeight: 700, fontSize: '1.25rem', pb: 1 }}>
            북마크 저장
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="save-bookmarks-dialog-description" sx={{ fontSize: '0.9375rem', color: 'text.primary' }}>
              북마크 {Array.from(pendingBookmarks).filter(id => !savedBookmarkIds.has(id)).length}개를 저장할까요?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setShowSaveConfirmDialog(false)}
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
              onClick={async () => {
                setShowSaveConfirmDialog(false)
                setSavingBookmarks(true)
                try {
                  // 이미 저장된 북마크를 제외하고 새로 추가된 북마크만 필터링
                  const newBookmarkIds = Array.from(pendingBookmarks).filter(
                    messageId => !savedBookmarkIds.has(messageId)
                  )
                  
                  // 새로 추가된 북마크가 없으면 바로 닫기
                  if (newBookmarkIds.length === 0) {
                    onClose()
                    setSavingBookmarks(false)
                    return
                  }
                  
                  // 새로 추가된 북마크만 저장
                  const bookmarkPromises = newBookmarkIds.map(messageId => 
                    createBookmark(messageId).catch(err => {
                      return { error: true, messageId, errorMessage: err?.message || 'Unknown error' }
                    })
                  )
                  
                  const results = await Promise.all(bookmarkPromises)
                  const successCount = results.filter(r => r === undefined || (r && !r.error)).length
                  const failedResults = results.filter(r => r && r.error)
                  
                  if (failedResults.length > 0) {
                    alert(`북마크 저장 실패: ${failedResults.length}개 실패\n\n실패한 메시지 ID: ${failedResults.map(f => f.messageId).join(', ')}\n\n에러: ${failedResults[0]?.errorMessage || '알 수 없는 오류'}`)
                    // 실패한 것들만 pendingBookmarks에서 제거
                    const failedMessageIds = new Set(failedResults.map(f => f.messageId))
                    setPendingBookmarks(prev => {
                      const newSet = new Set(prev)
                      failedMessageIds.forEach(id => newSet.delete(id))
                      return newSet
                    })
                  } else {
                    // 성공한 북마크들을 savedBookmarkIds에 추가
                    setSavedBookmarkIds(prev => {
                      const newSet = new Set(prev)
                      newBookmarkIds.forEach(id => newSet.add(id))
                      return newSet
                    })
                    // 모든 북마크 저장 성공 시 닫기
                    onClose()
                  }
                } catch (err) {
                  alert('북마크 저장 중 오류가 발생했습니다: ' + (err?.message || '알 수 없는 오류'))
                } finally {
                  setSavingBookmarks(false)
                }
              }}
              variant="contained"
              disabled={savingBookmarks}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: 'linear-gradient(135deg, #7C6CFF 0%, #4B3CF8 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6B5CE6 0%, #3B2CE8 100%)'
                }
              }}
            >
              예
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

// 더미 데이터
const MOCK_CONVERSATION = [
  { who: 'AI', text: 'What is your role in the project?' },
  { who: 'You', text: 'I handle frontend development and UX validation.' },
  { who: 'AI', text: 'How do you prioritize feature requests?' },
  { who: 'You', text: 'We use impact vs. effort scoring and run quick user tests.' }
]
