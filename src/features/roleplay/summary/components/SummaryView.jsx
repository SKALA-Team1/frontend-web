import React, { useState, useEffect } from 'react'
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
  Chip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TranslateIcon from '@mui/icons-material/Translate'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { getComprehensiveFeedback, getSessionUtterances } from '../../../../services/roleplayService'
import { createBookmark } from '../../../../services/bookmarkService'
import LoadingSpinner from '../../../../components/Common/LoadingSpinner'

const normalizeConversationMessages = (rawMessages = []) => {
  if (!Array.isArray(rawMessages)) return []
  return rawMessages
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
}

export default function SummaryView({
  messages,
  onClose,
  scenarioTitle = '롤플레잉 시나리오',
  sessionId = null
}) {
  const [isConversationOpen, setIsConversationOpen] = React.useState(true)
  const [isLongOpen, setIsLongOpen] = React.useState(false)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bookmarkedMessages, setBookmarkedMessages] = useState({})
  const [messageIdMap, setMessageIdMap] = useState({}) // utterance_index -> messageId 매핑
  const [pendingBookmarks, setPendingBookmarks] = useState(new Set()) // 선택된 북마크 messageId들 (닫기 버튼에서 저장)
  const [savingBookmarks, setSavingBookmarks] = useState(false) // 북마크 저장 중 상태
  const [utterances, setUtterances] = useState([]) // utterances 데이터 (피드백 포함)
  const [expandedFeedback, setExpandedFeedback] = useState({}) // 피드백 토글 상태 (messageId -> boolean)

  const normalizedMessages = normalizeConversationMessages(messages)
  const displayMessages = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION

  // utterances 가져와서 messageId 매핑 (한 번만 실행)
  useEffect(() => {
    if (!sessionId) return

    const loadUtterances = async () => {
      try {
        const utterancesData = await getSessionUtterances(sessionId)
        const utterances = utterancesData?.utterances || []
        
        // utterances를 turn_index 순서로 정렬
        const sortedUtterances = [...utterances].sort((a, b) => 
          (a.utterance_index || 0) - (b.utterance_index || 0)
        )
        
        // displayMessages의 인덱스와 utterances의 turn_index를 매칭
        // displayMessages는 AI와 User가 번갈아 나오므로, turn_index로 직접 매칭 불가
        // 대신 텍스트 매칭으로 user 메시지의 messageId 찾기
        const idMap = {}
        const currentDisplayMessages = normalizedMessages.length > 0 ? normalizedMessages : MOCK_CONVERSATION
        
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
      } catch (err) {
        console.error('[SummaryView] Failed to load utterances:', err)
      }
    }

    loadUtterances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]) // displayMessages 제거 - messages prop이 변경될 때만 재실행되도록

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
            avgPronunciation: feedbackData?.avgPronunciation,
            avgPronunciaition: feedbackData?.avgPronunciaition,
            avgGrammar: feedbackData?.avgGrammar,
            avgRelevance: feedbackData?.avgRelevance,
            feedbackShort: feedbackData?.feedbackShort,
            feedback_short: feedbackData?.feedback_short,
            feedbackLong: feedbackData?.feedbackLong,
            feedback_long: feedbackData?.feedback_long
          })
          setFeedback(feedbackData)
          setLoading(false)
        } catch (err) {
          // 404 에러면 피드백이 아직 생성 중이므로 계속 폴링
          if (err.response?.status === 404 && pollCount < MAX_POLLS) {
            pollCount++
            setTimeout(tryPoll, POLL_INTERVAL)
          } else {
            console.error('[SummaryView] 피드백 조회 실패:', err)
            setError('피드백을 불러오는 중 오류가 발생했습니다.')
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

  // 로딩 중이거나 피드백이 없으면 전체 페이지 대신 로딩 스피너만 표시
  if (loading || !feedback) {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 }, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="종합 피드백을 생성하고 있습니다..." />
      </Box>
    )
  }

  // 에러가 있으면 에러 메시지 표시
  if (error) {
    return (
      <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 } }}>
        <Alert severity="warning" sx={{ mb: 1 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={async () => {
            // 선택된 북마크들을 일괄 저장
            if (pendingBookmarks.size > 0) {
              setSavingBookmarks(true)
              try {
                const messageIds = Array.from(pendingBookmarks)
                
                const bookmarkPromises = messageIds.map(messageId => 
                  createBookmark(messageId).catch(err => {
                    return { error: true, messageId, errorMessage: err?.message || 'Unknown error' }
                  })
                )
                
                const results = await Promise.all(bookmarkPromises)
                const successCount = results.filter(r => r === undefined || (r && !r.error)).length
                const failedResults = results.filter(r => r && r.error)
                
                if (failedResults.length > 0) {
                  alert(`북마크 저장 실패: ${failedResults.length}개 실패\n\n실패한 메시지 ID: ${failedResults.map(f => f.messageId).join(', ')}\n\n에러: ${failedResults[0]?.errorMessage || '알 수 없는 오류'}`)
                }
                
                // 저장 완료 후 상태 초기화
                setPendingBookmarks(new Set())
              } catch (err) {
                alert('북마크 저장 중 오류가 발생했습니다: ' + (err?.message || '알 수 없는 오류'))
              } finally {
                setSavingBookmarks(false)
              }
            }
            
            // 닫기 콜백 실행
            onClose()
          }}
          disabled={savingBookmarks}
          sx={{ mt: 2 }}
        >
          {savingBookmarks ? '저장 중...' : pendingBookmarks.size > 0 ? `닫기 (${pendingBookmarks.size}개 저장)` : '닫기'}
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 0 } }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Stack spacing={0.5} alignItems="center" textAlign="center">
          <Typography variant="overline" sx={{ letterSpacing: 1.2, color: 'text.secondary' }}>
            롤플레잉 종합 피드백
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {scenarioTitle || '롤플레잉 시나리오'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            짧은 요약과 상세 피드백을 확인하고 대화 로그를 복기하세요.
          </Typography>
        </Stack>

        {/* 종합 피드백 */}
        <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(124,108,255,0.2)',
              background: 'linear-gradient(135deg, rgba(124,108,255,0.04) 0%, rgba(75,60,248,0.02) 100%)',
              boxShadow: '0 8px 24px rgba(124,108,255,0.12)'
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 점수 표시 */}
              {(avgPronunciation !== null || avgGrammar !== null || avgRelevance !== null) && (
                <>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
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
                          label={`관련성: ${avgRelevance}점`}
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
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  짧은 버전
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {shortFeedback}
                </Typography>
              </Box>

              <Divider />

              {/* 긴 피드백 */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    긴 버전
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setIsLongOpen((prev) => !prev)}
                    sx={{ transform: isLongOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Collapse in={isLongOpen} timeout="auto" unmountOnExit>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {longFeedback}
                  </Typography>
                </Collapse>
              </Box>
            </CardContent>
          </Card>

        {/* 대화 로그 */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
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
            <Stack spacing={1.5}>
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
                        borderRadius: 2,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
                      }}
                    >
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {msg.text}
                        </Typography>
                        {msg.translation && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                            {msg.translation}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* 사용자 발화 밑에 피드백 점수 및 내용 */}
                    {isUser && hasFeedback && (
                      <Box sx={{ alignSelf: 'flex-end', maxWidth: '88%', mt: 0.5 }}>
                        {/* 점수는 기본으로 항상 표시 */}
                        {(userUtterance.pronunciation_score !== null || 
                          userUtterance.grammar_score !== null || 
                          userUtterance.relevance_score !== null) && (
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
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
                                label={`관련성: ${userUtterance.relevance_score}점`}
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
                        
                        {/* 피드백 내용이 있는 경우에만 토글 버튼 표시 */}
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
                            <>
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
                              <Collapse in={isFeedbackExpanded} timeout="auto" unmountOnExit>
                                <Card
                                  variant="outlined"
                                  sx={{
                                    mt: 1,
                                    bgcolor: 'rgba(124,108,255,0.04)',
                                    border: '1px solid rgba(124,108,255,0.15)',
                                    borderRadius: 2
                                  }}
                                >
                                  <CardContent sx={{ py: 1.5, px: 2 }}>
                                    {/* 피드백 섹션 표시 (롤플레잉 도중 채팅과 동일한 형식) */}
                                    {(() => {
                                      const feedbackTypeLabels = {
                                        pronunciation: '발음',
                                        grammar: '문법',
                                        relevance: '관련성'
                                      }
                                      
                                      return (
                                        <Stack spacing={1.5}>
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
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
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
                                                {sectionIdx < feedbackSections.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                                              </Box>
                                            )
                                          })}
                                        </Stack>
                                      )
                                    })()}
                                  </CardContent>
                                </Card>
                              </Collapse>
                            </>
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
          onClick={async () => {
            // 선택된 북마크들을 일괄 저장
            if (pendingBookmarks.size > 0) {
              setSavingBookmarks(true)
              try {
                const messageIds = Array.from(pendingBookmarks)
                
                const bookmarkPromises = messageIds.map(messageId => 
                  createBookmark(messageId).catch(err => {
                    return { error: true, messageId, errorMessage: err?.message || 'Unknown error' }
                  })
                )
                
                const results = await Promise.all(bookmarkPromises)
                const successCount = results.filter(r => r === undefined || (r && !r.error)).length
                const failedResults = results.filter(r => r && r.error)
                
                if (failedResults.length > 0) {
                  alert(`북마크 저장 실패: ${failedResults.length}개 실패\n\n실패한 메시지 ID: ${failedResults.map(f => f.messageId).join(', ')}\n\n에러: ${failedResults[0]?.errorMessage || '알 수 없는 오류'}`)
                }
                
                // 저장 완료 후 상태 초기화
                setPendingBookmarks(new Set())
              } catch (err) {
                alert('북마크 저장 중 오류가 발생했습니다: ' + (err?.message || '알 수 없는 오류'))
              } finally {
                setSavingBookmarks(false)
              }
            }
            
            // 닫기 콜백 실행
            onClose()
          }}
          disabled={savingBookmarks}
          sx={{ mt: 2 }}
        >
          {savingBookmarks ? '저장 중...' : pendingBookmarks.size > 0 ? `닫기 (${pendingBookmarks.size}개 저장)` : '닫기'}
        </Button>
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
