import React from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Stack, List, ListItemButton, ListItemText, Chip, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export default function LearnChapterList({ chapters }) {
  return (
    <Stack spacing={2}>
      {chapters.map((title, idx) => (
        <Accordion
          key={idx}
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.02)',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 },
            '&:first-of-type': { borderRadius: 3 },
            '&:last-of-type': { borderRadius: 3 }
          }}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon 
                sx={{ 
                  color: '#F5F6FF',
                  fontSize: 28
                }} 
              />
            }
            sx={{
              bgcolor: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              px: 2,
              py: 1.5,
              '&.Mui-expanded': {
                minHeight: 56,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.04)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip 
                label={`Chapter ${idx + 1}`} 
                size="small" 
                variant="outlined"
                sx={{
                  borderColor: 'rgba(124,108,255,0.5)',
                  color: '#6C63FF',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#F5F6FF'
                }}
              >
                {title}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 2.5, px: 2, backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <List disablePadding>
              {[1, 2, 3].map((lesson) => (
                  <ListItemButton
                    key={lesson}
                    sx={{
                      borderRadius: 2,
                      mb: 1.5,
                      px: 2,
                      py: 1.5,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(124,108,255,0.4)'
                      }
                    }}
                  >
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#F5F6FF',
                          mb: 0.5
                        }}
                      >
                        Lesson {lesson}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(245,246,255,0.7)',
                          fontSize: '0.875rem'
                        }}
                      >
                        {title} - 핵심 표현 익히기
                      </Typography>
                    }
                  />
                  {lesson === 1 && (
                    <Chip 
                      variant="outlined" 
                      label="Start" 
                      size="small"
                      sx={{
                        borderColor: 'rgba(124,108,255,0.5)',
                        color: '#6C63FF',
                        fontWeight: 600
                      }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

