import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Stack, 
  Card, 
  CardContent, 
  Box,
  Chip,
  IconButton,
  Collapse,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import useBookmarks from '../../../hooks/useBookmarks'

// 더미 북마크 채팅 데이터 5개
const MOCK_BOOKMARKED_CHATS = [
  {
    id: 1,
    scenarioTitle: 'Database Performance Optimization',
    executedDate: '2024-12-15',
    aiRole: 'Tech Lead',
    myRole: 'Backend Developer',
    aiQuestion: 'Can you walk me through the reasoning behind adding these specific evaluation-related columns and indexes to the scenario_message and scenario_session tables?',
    myAnswer: 'We\'ve identified the root cause. The issue is in the report generation module where we\'re not properly handling the new finance filters. We\'re implementing a temporary workaround by caching the filter results, and this expect to have a permanent fix by next week.',
    bookmarkDate: '2024-12-15 14:30',
    sessionId: 'session-1',
    scores: {
      pronunciation: 85,
      grammar: 92,
      relevance: 88
    },
    feedbacks: {
      pronunciation: {
        feedback_en: 'Your pronunciation is generally clear, but pay attention to the stress on "evaluation" and "indexes". The word "scenario" could be pronounced with more emphasis on the second syllable.',
        feedback_ko: '발음이 전반적으로 명확하지만, "evaluation"과 "indexes"의 강세에 주의하세요. "scenario"는 두 번째 음절에 더 강세를 주어 발음하면 좋습니다.',
        score: 85
      },
      grammar: {
        feedback_en: 'Minor grammatical issue: "this expect" should be "we expect". Otherwise, the sentence structure is well-formed.',
        feedback_ko: '작은 문법 오류: "this expect"는 "we expect"로 수정해야 합니다. 그 외에는 문장 구조가 잘 형성되어 있습니다.',
        score: 92
      },
      relevance: {
        feedback_en: 'Your response directly addresses the question about reasoning and implementation details. Good connection to the technical context.',
        feedback_ko: '답변이 추론과 구현 세부사항에 대한 질문을 직접적으로 다루고 있습니다. 기술적 맥락과의 연결이 좋습니다.',
        score: 88
      }
    }
  },
  {
    id: 2,
    scenarioTitle: 'API Endpoint Design Discussion',
    executedDate: '2024-12-14',
    aiRole: 'Senior Engineer',
    myRole: 'Full Stack Developer',
    aiQuestion: 'How do you plan to validate and test the effectiveness of the proposed indexing/query tuning for complex finance filters?',
    myAnswer: 'We\'ll test it first on staging with real-like finance filter cases and compare latency/DB load before vs after. If the results look stable, we\'ll roll it out gradually to production.',
    bookmarkDate: '2024-12-14 16:20',
    sessionId: 'session-2',
    scores: {
      pronunciation: 78,
      grammar: 95,
      relevance: 90
    },
    feedbacks: {
      pronunciation: {
        feedback_en: 'The pronunciation of "validate" and "effectiveness" needs improvement. Try to enunciate each syllable more clearly.',
        feedback_ko: '"validate"와 "effectiveness"의 발음이 개선이 필요합니다. 각 음절을 더 명확하게 발음해보세요.',
        score: 78
      },
      grammar: {
        feedback_en: 'Excellent grammar throughout. The sentence structure is professional and clear.',
        feedback_ko: '전반적으로 문법이 우수합니다. 문장 구조가 전문적이고 명확합니다.',
        score: 95
      },
      relevance: {
        feedback_en: 'Your answer provides a clear testing strategy that directly relates to the question about validation methods.',
        feedback_ko: '답변이 검증 방법에 대한 질문과 직접적으로 관련된 명확한 테스트 전략을 제공합니다.',
        score: 90
      }
    }
  },
  {
    id: 3,
    scenarioTitle: 'Code Review and Refactoring',
    executedDate: '2024-12-13',
    aiRole: 'Engineering Manager',
    myRole: 'Junior Developer',
    aiQuestion: 'Can you elaborate on how you plan to handle any potential performance regressions during the gradual roll-out?',
    myAnswer: 'If we see regressions, we\'ll pause or roll back the canary and check logs/metrics to find the cause. We\'ll add extra monitoring for Redis timeouts, pool usage, and endpoint latency.',
    bookmarkDate: '2024-12-13 11:15',
    sessionId: 'session-3',
    scores: {
      pronunciation: 82,
      grammar: 88,
      relevance: 85
    },
    feedbacks: {
      pronunciation: {
        feedback_en: 'Good overall pronunciation. Work on the clarity of "regressions" and "canary" for better communication.',
        feedback_ko: '전반적으로 발음이 좋습니다. "regressions"와 "canary"의 명확성을 개선하면 더 좋습니다.',
        score: 82
      },
      grammar: {
        feedback_en: 'Mostly correct grammar. Consider using "we will" instead of "we\'ll" in formal contexts for better clarity.',
        feedback_ko: '대부분 문법이 정확합니다. 공식적인 맥락에서는 "we\'ll" 대신 "we will"을 사용하는 것이 더 명확합니다.',
        score: 88
      },
      relevance: {
        feedback_en: 'Your response addresses the question about handling regressions, though it could be more specific about the monitoring approach.',
        feedback_ko: '답변이 회귀 문제 처리에 대한 질문을 다루고 있지만, 모니터링 접근 방식에 대해 더 구체적일 수 있습니다.',
        score: 85
      }
    }
  },
  {
    id: 4,
    scenarioTitle: 'System Architecture Planning',
    executedDate: '2024-12-12',
    aiRole: 'Architect',
    myRole: 'Software Engineer',
    aiQuestion: 'What are the next steps to resolve the issue, and when can we expect a fix or further updates from your team?',
    myAnswer: 'We\'re wrapping up the fix now and will run final tests soon. You can expect an update shortly, and we plan to deliver the final patch within the next few days.',
    bookmarkDate: '2024-12-12 09:45',
    sessionId: 'session-4',
    scores: {
      pronunciation: 90,
      grammar: 93,
      relevance: 87
    },
    feedbacks: {
      pronunciation: {
        feedback_en: 'Excellent pronunciation. All technical terms are clearly articulated and easy to understand.',
        feedback_ko: '발음이 우수합니다. 모든 기술 용어가 명확하게 발음되어 이해하기 쉽습니다.',
        score: 90
      },
      grammar: {
        feedback_en: 'Very good grammar with only minor improvements possible. The use of "we\'re" and "we plan" is appropriate.',
        feedback_ko: '문법이 매우 좋으며, 작은 개선만 가능합니다. "we\'re"와 "we plan"의 사용이 적절합니다.',
        score: 93
      },
      relevance: {
        feedback_en: 'Your response provides a timeline and next steps, which addresses the question, though more detail on the specific steps would strengthen it.',
        feedback_ko: '답변이 타임라인과 다음 단계를 제공하여 질문에 답하고 있지만, 구체적인 단계에 대한 더 자세한 설명이 있으면 더 좋습니다.',
        score: 87
      }
    }
  },
  {
    id: 5,
    scenarioTitle: 'Bug Fix and Deployment Strategy',
    executedDate: '2024-12-11',
    aiRole: 'QA Engineer',
    myRole: 'DevOps Engineer',
    aiQuestion: 'Can you explain how you envision the process of analyzing and addressing potential root causes for performance regressions?',
    myAnswer: 'We\'ll check alerts first, then compare metrics before/after the rollout to spot what changed. If needed, we\'ll reproduce it on staging, fix the specific part, and redeploy quickly.',
    bookmarkDate: '2024-12-11 15:30',
    sessionId: 'session-5',
    scores: {
      pronunciation: 88,
      grammar: 90,
      relevance: 92
    },
    feedbacks: {
      pronunciation: {
        feedback_en: 'Clear pronunciation overall. Pay attention to the stress pattern in "analyzing" and "addressing" for more natural flow.',
        feedback_ko: '전반적으로 발음이 명확합니다. 더 자연스러운 흐름을 위해 "analyzing"과 "addressing"의 강세 패턴에 주의하세요.',
        score: 88
      },
      grammar: {
        feedback_en: 'Good grammatical structure. The sentence flow is clear and professional.',
        feedback_ko: '문법 구조가 좋습니다. 문장 흐름이 명확하고 전문적입니다.',
        score: 90
      },
      relevance: {
        feedback_en: 'Excellent response that directly explains the process of analyzing and addressing root causes, with clear steps outlined.',
        feedback_ko: '근본 원인 분석 및 해결 과정을 직접적으로 설명하고 명확한 단계를 제시하는 우수한 답변입니다.',
        score: 92
      }
    }
  }
]

export default function UserPage() {
  const { bookmarks, loading, error, removeBookmark, refreshBookmarks } = useBookmarks()
  const [expandedCards, setExpandedCards] = useState({})

  // UserPage 마운트 시 북마크 목록 로드 (한 번만 실행)
  useEffect(() => {
    refreshBookmarks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleExpand = (bookmarkId) => {
    setExpandedCards(prev => ({
      ...prev,
      [bookmarkId]: !prev[bookmarkId]
    }))
  }

  const handleDeleteBookmark = async (bookmarkId) => {
    if (window.confirm('북마크를 삭제하시겠습니까?')) {
      await removeBookmark(bookmarkId)
    }
  }

  // 피드백 타입별 라벨 매핑
  const feedbackTypeLabels = {
    pronunciation: '발음',
    grammar: '문법',
    relevance: '관련성'
  }

  return (
    <Stack spacing={3}>
      {/* 헤더 */}
      <Stack spacing={0.5} alignItems="center" textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          북마크
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.75 }}>
          북마크한 채팅을 확인하세요
        </Typography>
      </Stack>

      {/* 북마크 채팅 리스트 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!loading && !error && (!Array.isArray(bookmarks) || bookmarks.length === 0) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            북마크한 채팅이 없습니다.
          </Typography>
        </Box>
      )}
      <Stack spacing={2.5}>
        {Array.isArray(bookmarks) && bookmarks.map((bookmark) => {
          // feedbackSections를 맵으로 변환 (type을 키로)
          const feedbacksMap = {}
          if (bookmark.feedbackSections && Array.isArray(bookmark.feedbackSections)) {
            bookmark.feedbackSections.forEach(section => {
              feedbacksMap[section.type] = section
            })
          }
          
          return (
          <Card
            key={bookmark.id}
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
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
                background: 'linear-gradient(180deg, #FFA500 0%, #FF8C00 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover': {
                boxShadow: '0 8px 24px rgba(255,165,0,0.2)',
                borderColor: 'rgba(255,165,0,0.3)',
                transform: 'translateY(-4px)',
                '&::before': {
                  opacity: 1
                }
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative' }}>
              {/* 북마크 아이콘 - 카드 오른쪽 위 */}
              <IconButton
                onClick={() => handleDeleteBookmark(bookmark.bookmarkId)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: '#FFA500',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)',
                    color: '#FF8C00'
                  },
                  transition: 'color 0.2s ease',
                  zIndex: 1
                }}
              >
                <BookmarkIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <Stack spacing={2}>
                {/* AI 질문 */}
                <Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mb: 1,
                        fontWeight: 600
                      }}
                    >
                      AI 질문
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#212121',
                          lineHeight: 1.6
                        }}
                      >
                        {bookmark.aiQuestion || 'AI 질문 없음'}
                      </Typography>
                    </Box>
                  </Box>

                {/* 내 답변 */}
                <Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block', 
                        mb: 1,
                        fontWeight: 600
                      }}
                    >
                      내 답변
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(124,108,255,0.08)',
                        border: '1px solid rgba(124,108,255,0.2)'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#212121',
                          lineHeight: 1.6
                        }}
                      >
                        {bookmark.messageText}
                      </Typography>
                    </Box>
                  </Box>

                {/* 점수 */}
                {bookmark.feedbackSections && bookmark.feedbackSections.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {bookmark.feedbackSections.map((section) => {
                      if (!section.score) return null
                      const typeColors = {
                        pronunciation: { bg: 'rgba(76,175,80,0.1)', color: '#4caf50', border: 'rgba(76,175,80,0.2)' },
                        grammar: { bg: 'rgba(33,150,243,0.1)', color: '#2196f3', border: 'rgba(33,150,243,0.2)' },
                        relevance: { bg: 'rgba(255,152,0,0.1)', color: '#ff9800', border: 'rgba(255,152,0,0.2)' }
                      }
                      const colors = typeColors[section.type] || typeColors.pronunciation
                      return (
                        <Chip
                          key={section.type}
                          label={`${feedbackTypeLabels[section.type] || section.type} ${section.score}`}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            bgcolor: colors.bg,
                            color: colors.color,
                            border: `1px solid ${colors.border}`
                          }}
                        />
                      )
                    })}
                  </Box>
                )}

                {/* 점수 (기존 코드 백업용 - 추후 제거 가능) */}
                {(!bookmark.feedbackSections || bookmark.feedbackSections.length === 0) && bookmark.scores && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {bookmark.scores.pronunciation && (
                      <Chip
                        label={`발음 ${bookmark.scores.pronunciation}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          bgcolor: 'rgba(76,175,80,0.1)',
                          color: '#4caf50',
                          border: '1px solid rgba(76,175,80,0.2)'
                        }}
                      />
                    )}
                    {bookmark.scores.grammar && (
                      <Chip
                        label={`문법 ${bookmark.scores.grammar}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          bgcolor: 'rgba(33,150,243,0.1)',
                          color: '#2196f3',
                          color: '#2196f3',
                          border: '1px solid rgba(33,150,243,0.2)'
                        }}
                      />
                    )}
                    {bookmark.scores.relevance && (
                      <Chip
                        label={`문맥 ${bookmark.scores.relevance}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          bgcolor: 'rgba(156,39,176,0.1)',
                          color: '#9c27b0',
                          border: '1px solid rgba(156,39,176,0.2)'
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* 상세보기 버튼 */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    gap: 0.5,
                    pt: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      '& .detail-text': {
                        color: 'primary.main'
                      },
                      '& .detail-icon': {
                        color: 'primary.main'
                      }
                    }
                  }}
                  onClick={() => handleToggleExpand(bookmark.bookmarkId)}
                >
                  <Typography 
                    variant="body2" 
                    className="detail-text"
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      transition: 'color 0.2s ease'
                    }}
                  >
                    상세보기
                  </Typography>
                  {expandedCards[bookmark.bookmarkId] ? (
                    <ExpandLessIcon className="detail-icon" sx={{ fontSize: 20, color: 'text.secondary', transition: 'color 0.2s ease' }} />
                  ) : (
                    <ExpandMoreIcon className="detail-icon" sx={{ fontSize: 20, color: 'text.secondary', transition: 'color 0.2s ease' }} />
                  )}
                </Box>

                {/* 피드백 상세 (토글) */}
                <Collapse in={expandedCards[bookmark.bookmarkId]}>
                  <Box sx={{ pt: 2 }}>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.08)' }} />
                    <Stack spacing={2.5}>
                      {/* 피드백 섹션들 */}
                      {bookmark.feedbackSections && bookmark.feedbackSections.length > 0 ? (
                        bookmark.feedbackSections.map((section) => {
                          const typeColors = {
                            pronunciation: { bg: 'rgba(76,175,80,0.05)', border: 'rgba(76,175,80,0.15)' },
                            grammar: { bg: 'rgba(33,150,243,0.05)', border: 'rgba(33,150,243,0.15)' },
                            relevance: { bg: 'rgba(255,152,0,0.05)', border: 'rgba(255,152,0,0.15)' }
                          }
                          const colors = typeColors[section.type] || typeColors.pronunciation
                          return (
                            <Box key={section.type}>
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                {feedbackTypeLabels[section.type] || section.type} 피드백
                              </Typography>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: colors.bg,
                                  border: `1px solid ${colors.border}`
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#212121', lineHeight: 1.6, mb: 1 }}>
                                  {section.feedbackKo || section.feedback_ko || ''}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                  {section.feedbackEn || section.feedback_en || ''}
                                </Typography>
                              </Box>
                            </Box>
                          )
                        })
                      ) : (
                        // 기존 코드 (백업용 - 추후 제거 가능)
                        <>
                          {/* 발음 피드백 */}
                          {feedbacksMap.pronunciation && (
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                발음 피드백
                              </Typography>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(76,175,80,0.05)',
                                  border: '1px solid rgba(76,175,80,0.15)'
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#212121', lineHeight: 1.6, mb: 1 }}>
                                  {feedbacksMap.pronunciation.feedback_ko || feedbacksMap.pronunciation.feedbackKo}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                  {feedbacksMap.pronunciation.feedback_en || feedbacksMap.pronunciation.feedbackEn}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* 문법 피드백 */}
                          {feedbacksMap.grammar && (
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                                문법 피드백
                              </Typography>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(33,150,243,0.05)',
                                  border: '1px solid rgba(33,150,243,0.15)'
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#212121', lineHeight: 1.6, mb: 1 }}>
                                  {feedbacksMap.grammar.feedback_ko || feedbacksMap.grammar.feedbackKo}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                  {feedbacksMap.grammar.feedback_en || feedbacksMap.grammar.feedbackEn}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </>
                      )}

                      {/* 관련성 피드백 (기존 코드 - 추후 제거 가능) */}
                      {feedbacksMap.relevance && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                            문맥 피드백
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(156,39,176,0.05)',
                              border: '1px solid rgba(156,39,176,0.15)'
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#212121', lineHeight: 1.6, mb: 1 }}>
                              {feedbacksMap.relevance.feedback_ko || feedbacksMap.relevance.feedbackKo}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              {feedbacksMap.relevance.feedback_en || feedbacksMap.relevance.feedbackEn}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Stack>
            </CardContent>
          </Card>
        )
        })}
      </Stack>
    </Stack>
  )
}
