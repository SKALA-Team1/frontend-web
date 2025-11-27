export const generateSuggestion = (userText = '') => {
  if (!userText || typeof userText !== 'string') {
    return "We're working on addressing the issue and will provide an update shortly."
  }

  const text = userText.toLowerCase()
  const trimmed = userText.trim()

  const firstSentence = trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)[0] || trimmed

  if (text.includes('root cause') || text.includes('issue') || text.includes('problem')) {
    return `${firstSentence}. We'll share follow-up actions and a recovery timeline shortly.`
  }

  if (text.includes('temporary') || text.includes('workaround') || text.includes('short-term')) {
    return `${firstSentence}. We'll also outline the permanent fix plan to ensure long-term stability.`
  }

  if (text.includes('test') || text.includes('testing') || text.includes('staging')) {
    return `${firstSentence}. We'll run thorough staging tests and share the key metrics before rollout.`
  }

  if (text.includes('fix') || text.includes('solution') || text.includes('resolve')) {
    return `${firstSentence}. We'll keep everyone posted on progress and expected delivery dates.`
  }

  if (text.includes('monitor') || text.includes('track') || text.includes('watch')) {
    return `${firstSentence}. We'll monitor the critical KPIs and escalate any anomalies immediately.`
  }

  return `${firstSentence}. We'll provide regular updates and call out any risks we spot.`
}


