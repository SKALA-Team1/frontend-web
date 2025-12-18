import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Box
} from '@mui/material'

// Voice ID 매핑
const ACCENT_OPTIONS = [
  { label: '미국', value: 'XjLkpWUlnhS8i7gGz3lZ' },
  { label: '영국', value: 'Fahco4VZzobUeiPqni1S' },
  { label: '인도', value: 'xnx6sPTtvU635ocDt2j7' },
  { label: '베트남', value: 'U7vsLCpbWl9Lt8M1Gjtk' },
  { label: '필리핀', value: 'neuKegR4bFeXZWzEAgYg' },
  { label: '중국', value: '8xsdoepm9GrzPPzYsiLP' },
]

export default function AccentSelectionDialog({
  open,
  onClose,
  onStart,
  scenarioTitle
}) {
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_OPTIONS[0].value)

  const handleStart = () => {
    onStart(selectedAccent)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>억양 선택</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {scenarioTitle}
          </Typography>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value)}
            >
              {ACCENT_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  sx={{
                    mb: 1,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.9375rem',
                      fontWeight: 500
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleStart}>
          시작
        </Button>
      </DialogActions>
    </Dialog>
  )
}
