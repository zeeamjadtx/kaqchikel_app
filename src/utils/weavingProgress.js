// Weaving progress utility - manages stitches and blanket progress
import { getUser } from './auth'

const getStorageKey = (userId = null) => {
  if (!userId) {
    const user = getUser()
    userId = user ? user.id : 'guest'
  }
  return `kaqchikel_weaving_progress_${userId}`
}

// Different stitch patterns/colors inspired by traditional Mayan weaving
const STITCH_PATTERNS = [
  { name: 'Red Thread', color: 'bg-red-500', pattern: '▬' },
  { name: 'Blue Thread', color: 'bg-blue-500', pattern: '▬' },
  { name: 'Yellow Thread', color: 'bg-yellow-500', pattern: '▬' },
  { name: 'Green Thread', color: 'bg-green-500', pattern: '▬' },
  { name: 'Purple Thread', color: 'bg-purple-500', pattern: '▬' },
  { name: 'Orange Thread', color: 'bg-orange-500', pattern: '▬' },
  { name: 'Pink Thread', color: 'bg-pink-500', pattern: '▬' },
  { name: 'Indigo Thread', color: 'bg-indigo-500', pattern: '▬' },
]

export const getWeavingProgress = (userId = null) => {
  try {
    const storageKey = getStorageKey(userId)
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading weaving progress:', error)
  }

  // Default progress object; if a user is logged in, attach basic user info
  const user = getUser()
  return {
    totalStitches: 0,
    stitches: [],
    lastUpdated: new Date().toISOString(),
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture
        }
      : {
          id: 'guest',
          name: 'Invitado',
          email: null,
          picture: null
        }
  }
}

export const addStitch = (userId = null) => {
  const progress = getWeavingProgress(userId)
  const user = getUser()

  // Ensure progress has user metadata so it can be used in leaderboards
  progress.user = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    : progress.user || {
        id: 'guest',
        name: 'Invitado',
        email: null,
        picture: null
      }
  const stitchPattern = STITCH_PATTERNS[progress.totalStitches % STITCH_PATTERNS.length]
  
  const newStitch = {
    id: Date.now(),
    pattern: stitchPattern,
    timestamp: new Date().toISOString()
  }
  
  progress.stitches.push(newStitch)
  progress.totalStitches = progress.stitches.length
  progress.lastUpdated = new Date().toISOString()
  
  try {
    const storageKey = getStorageKey(userId)
    localStorage.setItem(storageKey, JSON.stringify(progress))
  } catch (error) {
    console.error('Error saving weaving progress:', error)
  }
  
  return progress
}

export const resetWeavingProgress = (userId = null) => {
  try {
    const storageKey = getStorageKey(userId)
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error resetting weaving progress:', error)
  }
}

export const getStitchPattern = (index) => {
  return STITCH_PATTERNS[index % STITCH_PATTERNS.length]
}

// Get leaderboard-style data for all users stored in localStorage
export const getWeavingLeaderboard = () => {
  const entries = []

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('kaqchikel_weaving_progress_')) continue

      const raw = localStorage.getItem(key)
      if (!raw) continue

      try {
        const progress = JSON.parse(raw)
        const user = progress.user || {
          id: key.replace('kaqchikel_weaving_progress_', ''),
          name: 'Invitado',
          email: null,
          picture: null
        }

        entries.push({
          user,
          totalStitches: progress.totalStitches || 0,
          lastUpdated: progress.lastUpdated
        })
      } catch (e) {
        console.error('Error parsing weaving progress for key:', key, e)
      }
    }
  } catch (error) {
    console.error('Error building weaving leaderboard:', error)
  }

  // Sort descending by totalStitches
  entries.sort((a, b) => (b.totalStitches || 0) - (a.totalStitches || 0))

  return entries
}
