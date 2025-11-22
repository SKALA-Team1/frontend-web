import React from 'react'
import { Drawer, Box, Typography, Divider, List, ListItem, ListItemText, Button } from '@mui/material'
import suggestionSnippets from '../../../data/roleplaySuggestions.json'

export default function SuggestionPanel({
  open,
  onClose,
  currentQuestion
}) {
  const suggestions = suggestionSnippets

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 320 } }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        <Typography variant="subtitle1" fontWeight={700}>Question</Typography>
        <Typography variant="body2" color="text.primary">{currentQuestion}</Typography>
        <Divider />
        <Typography variant="subtitle1" fontWeight={700}>Suggested sentences</Typography>
        <List dense>
          {suggestions.map((s, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={s} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto' }}>
          <Button fullWidth variant="outlined" onClick={onClose}>닫기</Button>
        </Box>
      </Box>
    </Drawer>
  )
}


