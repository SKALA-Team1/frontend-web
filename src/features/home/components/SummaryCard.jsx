import React from 'react'
import { CardContent, Grid, Box, Typography } from '@mui/material'

const surfaceSx = {
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 3,
  background: 'rgba(255,255,255,0.02)',
  p: 1.25,
  height: '100%',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}

export default function SummaryCard() {
  return (
    <CardContent sx={{ px: 0 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={4}>
            <Box sx={surfaceSx}>
              <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>내 부서</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>SW Engineering</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={surfaceSx}>
              <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>우리 부서 등수</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>3위</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={surfaceSx}>
              <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>나의 등수</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>10위</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
  )
}

