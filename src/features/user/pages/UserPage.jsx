import React from 'react'
import { Typography, Stack } from '@mui/material'
import useUserPage from '../hooks/useUserPage'
import ProfileSummary from '../components/ProfileSummary'
import BookmarkList from '../components/BookmarkList'
import RecordingList from '../components/RecordingList'

export default function UserPage() {
  const {
    email,
    newPassword,
    confirmPassword,
    bookmarkedSentences,
    recordings,
    handleEmailChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleAccountSave
  } = useUserPage()

  return (
    <Stack spacing={2}>
      <ProfileSummary />
      <BookmarkList bookmarkedSentences={bookmarkedSentences} />
      <RecordingList recordings={recordings} />
    </Stack>
  )
}


