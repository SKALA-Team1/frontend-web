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
  Box,
  Select,
  MenuItem,
  InputLabel
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

const INPUT_MODES = {
  TEXT: 'text',
  VOICE: 'voice'
}

export default function AccentSelectionDialog({
  open,
  onClose,
  onStart,
  scenarioTitle
}) {
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_OPTIONS[0].value)
  const [inputMode, setInputMode] = useState(INPUT_MODES.VOICE)

  const handleStart = () => {
    onStart(selectedAccent, inputMode)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle 
        sx={{ 
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 500
        }}
      >
        시작 설정
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {scenarioTitle}
          </Typography>
          
          {/* 나라 선택 드롭다운 */}
          <FormControl fullWidth>
            <InputLabel id="accent-select-label">나라</InputLabel>
            <Select
              labelId="accent-select-label"
              value={selectedAccent}
              label="나라"
              onChange={(e) => setSelectedAccent(e.target.value)}
            >
              {ACCENT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 텍스트 모드 / 음성 모드 선택 */}
          <FormControl component="fieldset" fullWidth>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
              입력방법
            </Typography>
            <RadioGroup
              value={inputMode}
              onChange={(e) => setInputMode(e.target.value)}
            >
              <FormControlLabel
                value={INPUT_MODES.VOICE}
                control={<Radio />}
                label="음성 모드"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9375rem',
                    fontWeight: 500
                  }
                }}
              />
              <FormControlLabel
                value={INPUT_MODES.TEXT}
                control={<Radio />}
                label="텍스트 모드"
                sx={{
                  mb: 1,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9375rem',
                    fontWeight: 500
                  }
                }}
              />
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
