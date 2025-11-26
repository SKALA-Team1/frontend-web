let bookmarkedSentences = []
const listeners = new Set()

const notify = () => {
  listeners.forEach((listener) => {
    try {
      listener(bookmarkedSentences)
    } catch (error) {
      console.warn('[bookmarkStore] listener error', error)
    }
  })
}

export const getBookmarks = () => bookmarkedSentences

export const updateBookmarks = (updater) => {
  const next = typeof updater === 'function' ? updater(bookmarkedSentences) : updater
  if (!Array.isArray(next)) {
    console.warn('[bookmarkStore] updater must return an array.')
    return
  }
  if (next === bookmarkedSentences) {
    return
  }
  bookmarkedSentences = next
  notify()
}

export const subscribeBookmarks = (listener) => {
  if (typeof listener !== 'function') {
    return () => {}
  }
  listeners.add(listener)
  return () => listeners.delete(listener)
}
