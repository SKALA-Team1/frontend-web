import { Typography, Stack, Box, Chip, CircularProgress, Alert } from '@mui/material'
import useBookmarks from '../../../hooks/useBookmarks'

export default function BookmarkList() {
  const { bookmarks, loading, error } = useBookmarks()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        {error}
      </Alert>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          북마크한 내용이 없습니다.
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={1}>
      {bookmarks.map((bookmark, idx) => {
        return (
          <Box
            key={bookmark.bookmarkId}
            sx={{
              p: 1,
              borderRadius: 2,
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(0,0,0,0.03)',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)',
                borderColor: 'rgba(124,108,255,0.3)'
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#212121' }}>
                {bookmark.scenarioTitle || '시나리오'}
              </Typography>
              <Chip
                label={`#${idx + 1}`}
                size="small"
                sx={{
                  borderRadius: 1,
                  backgroundColor: 'rgba(124,108,255,0.2)',
                  color: '#6C63FF',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Stack>

            <Stack spacing={0.75}>
              {/* AI 질문 */}
              {bookmark.aiQuestion && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block' }}>
                    AI 질문
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#212121', fontSize: '0.8125rem' }}>
                    {bookmark.aiQuestion}
                  </Typography>
                </Box>
              )}

              {/* 내 답변 */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block' }}>
                  내 답변
                </Typography>
                <Typography variant="body2" sx={{ color: '#212121', fontSize: '0.8125rem' }}>
                  {bookmark.messageText}
                </Typography>
              </Box>

              {/* 피드백 점수 태그 */}
              {bookmark.feedbackSections && bookmark.feedbackSections.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  {bookmark.feedbackSections.map((section) => {
                    const typeLabel = section.type === 'pronunciation' ? '발음' :
                                     section.type === 'grammar' ? '문법' : '문맥'
                    const color = section.type === 'pronunciation' ? '#4CAF50' :
                                 section.type === 'grammar' ? '#2196F3' : '#FF9800'

                    return (
                      <Chip
                        key={section.type}
                        label={`${typeLabel} ${section.score}`}
                        size="small"
                        sx={{
                          backgroundColor: `${color}20`,
                          color: color,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    )
                  })}
                </Stack>
              )}

              {/* 피드백 상세 내용 (항상 표시) */}
              {bookmark.feedbackSections && bookmark.feedbackSections.length > 0 && (
                <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                  {bookmark.feedbackSections.map((section) => {
                    const typeLabel = section.type === 'pronunciation' ? '발음 피드백' :
                                     section.type === 'grammar' ? '문법 피드백' : '문맥 피드백'

                    return (
                      <Box
                        key={section.type}
                        sx={{
                          p: 0.75,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(124,108,255,0.1)',
                          border: '1px dashed rgba(124,108,255,0.3)'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block' }}>
                          {typeLabel}
                        </Typography>
                        {section.feedbackKo && (
                          <Typography variant="body2" sx={{ color: '#212121', fontSize: '0.8125rem', mb: 0.25 }}>
                            {section.feedbackKo}
                          </Typography>
                        )}
                        {section.feedbackEn && (
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            {section.feedbackEn}
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </Stack>
          </Box>
        )
      })}
    </Stack>
  )
}
