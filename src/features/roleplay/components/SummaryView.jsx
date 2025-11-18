import React from 'react'
import { Tabs, Tab, Box, Stack, Typography, Card, CardContent, Button, Chip, IconButton } from '@mui/material'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import mockMessages from '../../../data/roleplayMockMessages.json'

const MOCK_MESSAGES = mockMessages

export default function SummaryView({
  summaryTab,
  setSummaryTab,
  messages,
  bookmarked,
  toggleBookmark,
  onClose
}) {
  const transcriptRows = React.useMemo(() => {
    const base = messages.length ? messages : MOCK_MESSAGES
    const suggs = [
      'Here is a concise follow‑up you could try to keep the discussion moving.',
      'Consider acknowledging the risk and proposing a measurable next step.',
      'Offer a concrete timeline and who will be responsible for the action.'
    ]
    let sIdx = 0
    const rows = []
    for (let i = 0; i < base.length; i++) {
      const m = base[i]
      rows.push({ ...m })
      if (m.who === 'You') {
        rows.push({ who: 'Suggest', text: suggs[sIdx % suggs.length] })
        sIdx++
      }
    }
    return rows
  }, [messages])

  return (
    <Box sx={{ mt: 2 }}>
      <Tabs value={summaryTab} onChange={(_, v) => setSummaryTab(v)} variant="fullWidth">
        <Tab value="summary" label="평가 요약" />
        <Tab value="transcript" label="대화 내용" />
      </Tabs>

      {summaryTab === 'summary' && (
        <Stack spacing={0} sx={{ mt: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {[{label:'발음 정확도'},{label:'문법 정확도'},{label:'표현 다양성'}].map((it,i)=>(
              <Box key={i} sx={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                <Box sx={{ width:92, height:92, borderRadius:'50%', border:'8px solid', borderColor:'grey.200', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Typography variant="h6">90%</Typography>
                </Box>
                <Typography variant="body2">{it.label}</Typography>
              </Box>
            ))}
          </Stack>
          
          {/* 키워드 기반 피드백 */}
          <Box sx={{ mt: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  한눈에 보는 피드백
                </Typography>
                <Stack spacing={3}>
                  {/* 발음 피드백 */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                      발음
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label="명확한 강세" color="success" size="small" variant="outlined" />
                      <Chip label="안정적인 리듬" color="success" size="small" variant="outlined" />
                      <Chip label="모음 길이 개선 필요" color="warning" size="small" variant="outlined" />
                    </Stack>
                  </Box>
                  
                  {/* 문법 피드백 */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                      문법
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label="시제 일관성 우수" color="success" size="small" variant="outlined" />
                      <Chip label="관사 사용 적절" color="success" size="small" variant="outlined" />
                      <Chip label="연결사 다양화 필요" color="warning" size="small" variant="outlined" />
                    </Stack>
                  </Box>
                  
                  {/* 표현 피드백 */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                      표현
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label="상황 설명 균형" color="success" size="small" variant="outlined" />
                      <Chip label="제안 문장 적절" color="success" size="small" variant="outlined" />
                      <Chip label="제안 톤 구분 강화" color="info" size="small" variant="outlined" />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* 전체 평가 자세히 */}
          <Box sx={{mt: 4, mb: 4}}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>AI 평가 요약</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>발음</Typography>
                    <Typography variant="body2" color="text.secondary">
                      발음은 전반적으로 명확했고 강세와 리듬이 안정적이었습니다. 모음 길이에서 소폭의 일관성 문제가 있었지만 의미 전달에는 영향이 크지 않았습니다.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>문법</Typography>
                    <Typography variant="body2" color="text.secondary">
                      문법은 시제 일관성과 관사 사용이 좋았습니다. 다만 복합문에서 연결사 사용이 반복되는 경향이 있어 다양한 패턴으로 바꾸면 더 자연스러워집니다.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>표현</Typography>
                    <Typography variant="body2" color="text.secondary">
                      표현은 상황 설명과 제안 문장이 균형 있게 사용되었습니다. 완곡한 제안(soft suggestion)과 확정적 제안(direct proposal)을 상황에 맞게 구분하면 더욱 설득력이 높아집니다.
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>개선 제안</Typography>
                    <Typography variant="body2" color="text.secondary">
                      다음 대화에서는 원인 가설 제시 → 근거 제시 → 실행 제안의 구조를 유지하면서, 숫자/시간 단위를 명시해 설득력을 강화해 보세요.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Button variant="outlined" onClick={onClose}>닫기</Button>
        </Stack>
      )}

      {summaryTab === 'transcript' && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {transcriptRows.map((m, i) => {
            const isAI = m.who === 'AI'
            const isYou = m.who === 'You'
            const isSuggest = m.who === 'Suggest'
            
            if (isSuggest) {
              const prevIdx = i - 1
              if (prevIdx >= 0 && transcriptRows[prevIdx]?.who === 'You') {
                return null
              }
            }

            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isYou ? 'flex-end' : 'flex-start',
                  gap: 0.5
                }}
              >
                <Box
                  sx={{
                    maxWidth: '88%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isYou ? 'grey.900' : 'grey.100',
                    color: isYou ? 'common.white' : 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {m.who}
                  </Typography>
                  <Typography variant="body2">{m.text}</Typography>
                </Box>
                {/* 제안 버블을 You 메시지 바로 밑에 표시 */}
                {isYou && i + 1 < transcriptRows.length && transcriptRows[i + 1]?.who === 'Suggest' && (
                  <Box
                    sx={{
                      maxWidth: '88%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      border: '1px dashed rgba(0,0,0,0.4)',
                      borderColor: 'rgba(0,0,0,0.3)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          제안
                        </Typography>
                        <Typography variant="body2">{transcriptRows[i + 1].text}</Typography>
                      </Box>
                      <IconButton
                        size="small"
                        aria-label="북마크"
                        onClick={() => toggleBookmark(i + 1)}
                      >
                        {bookmarked.has(i + 1) ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            )
          })}
          <Button variant="outlined" sx={{ mt: 2 }} onClick={onClose}>닫기</Button>
        </Stack>
      )}
    </Box>
  )
}


