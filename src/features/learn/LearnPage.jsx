import React from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack, List, ListItemButton, ListItemText, Chip, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import chapterTitles from '../../data/learnChapters.json'

export default function LearnPage() {
  return (
    <Stack spacing={2} sx={{ px: 4, py: 0 }}>
      <Typography variant="h5">학습</Typography>
      <Typography variant="body2" color="text.secondary">
        총 10개의 챕터, 각 챕터는 3개의 레슨으로 구성됩니다.
      </Typography>

      <Stack spacing={1}>
        {chapterTitles.map((title, idx) => (
          <Accordion key={idx} disableGutters elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2, overflow: 'hidden' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`Chapter ${idx + 1}`} size="small" variant="outlined" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>
                {[1, 2, 3].map((lesson) => (
                  <ListItemButton key={lesson} sx={{ borderRadius: 1, mb: 0.5, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
                    <ListItemText
                      primary={`Lesson ${lesson}`}
                      secondary={`${title} - 핵심 표현 익히기`}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                    {lesson === 1 && <Chip variant="outlined" label="Start" size="small" />}
                  </ListItemButton>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  )
}


