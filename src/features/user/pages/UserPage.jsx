import React, { useEffect, useState } from 'react'
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
  Alert,
  Button
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import useBookmarks from '../../../hooks/useBookmarks'

export default function UserPage() {
  const { bookmarks, loading, error, removeBookmark, refreshBookmarks } = useBookmarks()
  const [selectedBookmarks, setSelectedBookmarks] = useState(new Set()) // 선택된 북마크 ID들
  const [isSaving, setIsSaving] = useState(false)

  // UserPage 마운트 시 북마크 목록 로드 (한 번만 실행)
  useEffect(() => {
    refreshBookmarks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 북마크 목록이 변경되면 모든 북마크를 선택 상태로 초기화
  useEffect(() => {
    if (bookmarks && bookmarks.length > 0) {
      const allBookmarkIds = new Set(bookmarks.map(b => b.bookmarkId))
      setSelectedBookmarks(allBookmarkIds)
    }
  }, [bookmarks])

  // 북마크 토글 (선택/해제)
  const handleToggleBookmark = (bookmarkId) => {
    setSelectedBookmarks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId)
      } else {
        newSet.add(bookmarkId)
      }
      return newSet
    })
  }

  // 저장 버튼 클릭 - 선택 해제된 북마크 삭제
  const handleSaveBookmarks = async () => {
    if (!bookmarks || bookmarks.length === 0) return

    // 선택 해제된 북마크 찾기 (모든 북마크 중 선택되지 않은 것들)
    const unselectedBookmarks = bookmarks.filter(
      bookmark => !selectedBookmarks.has(bookmark.bookmarkId)
    )

    if (unselectedBookmarks.length === 0) {
      // 변경사항 없음
      return
    }

    setIsSaving(true)
    try {
      // 선택 해제된 북마크들을 모두 삭제
      const deletePromises = unselectedBookmarks.map(bookmark =>
        removeBookmark(bookmark.bookmarkId).catch(err => {
          console.error(`Failed to delete bookmark ${bookmark.bookmarkId}:`, err)
          return { error: true, bookmarkId: bookmark.bookmarkId }
        })
      )

      await Promise.all(deletePromises)
      
      // 성공 후 선택 상태 초기화 (남은 북마크만 선택 상태로)
      const remainingBookmarks = bookmarks.filter(
        bookmark => selectedBookmarks.has(bookmark.bookmarkId)
      )
      setSelectedBookmarks(new Set(remainingBookmarks.map(b => b.bookmarkId)))
      
      // 북마크 목록 새로고침
      await refreshBookmarks()
    } catch (err) {
      console.error('Failed to save bookmarks:', err)
      alert('북마크 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // 피드백 타입별 라벨 매핑
  const feedbackTypeLabels = {
    pronunciation: '발음',
    grammar: '문법',
    relevance: '문맥'
  }

  return (
    <Stack spacing={3}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <Stack spacing={0.5} sx={{ flex: 1, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            북마크
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.75 }}>
            북마크한 채팅을 확인하세요
          </Typography>
        </Stack>
        <Button
          variant="contained"
          onClick={handleSaveBookmarks}
          disabled={isSaving || loading || !bookmarks || bookmarks.length === 0}
          sx={{
            position: 'absolute',
            right: 0,
            minWidth: 'auto',
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </Box>

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
            key={bookmark.bookmarkId || bookmark.id}
            sx={{
              borderRadius: 1.5,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)'
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative' }}>
              {/* 북마크 토글 아이콘 - 카드 오른쪽 위 */}
              <IconButton
                onClick={() => handleToggleBookmark(bookmark.bookmarkId)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: selectedBookmarks.has(bookmark.bookmarkId) ? '#FFA500' : 'rgba(0,0,0,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)',
                    color: selectedBookmarks.has(bookmark.bookmarkId) ? '#FF8C00' : 'rgba(0,0,0,0.5)'
                  },
                  transition: 'color 0.2s ease',
                  zIndex: 1
                }}
              >
                {selectedBookmarks.has(bookmark.bookmarkId) ? (
                  <BookmarkIcon sx={{ fontSize: 20 }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 20 }} />
                )}
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
                      질문
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
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
                        borderRadius: 1,
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
                                borderRadius: 1,
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
