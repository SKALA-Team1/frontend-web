import React, { useEffect } from 'react'
import { 
  Typography, 
  Stack, 
  Card, 
  CardContent, 
  Box,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import useBookmarks from '../../../hooks/useBookmarks'

export default function UserPage() {
  const { bookmarks, loading, error, removeBookmark, refreshBookmarks } = useBookmarks()

  // UserPage 마운트 시 북마크 목록 로드 (한 번만 실행)
  useEffect(() => {
    refreshBookmarks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

                {/* 피드백 상세 (항상 표시) */}
                {bookmark.feedbackSections && bookmark.feedbackSections.length > 0 && (
                  <Box sx={{ pt: 2 }}>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.08)' }} />
                    <Stack spacing={2.5}>
                      {/* 피드백 섹션들 */}
                      {bookmark.feedbackSections.map((section) => {
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
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )
        })}
      </Stack>
    </Stack>
  )
}
