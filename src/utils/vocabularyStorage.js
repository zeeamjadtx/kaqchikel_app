// Local-only storage for per-user practice progress (decks come from the backend)
import { getUser } from './auth'

const getStorageKey = (userId = null) => {
  if (!userId) {
    const user = getUser()
    userId = user ? user.id : 'guest'
  }
  return `kaqchikel_saved_vocabulary_${userId}`
}

export const getSavedVocabularySets = (userId = null) => {
  try {
    const storageKey = getStorageKey(userId)
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading saved vocabulary sets:', error)
  }
  return []
}

export const getVocabularySetById = (id, userId = null) => {
  const sets = getSavedVocabularySets(userId)
  return sets.find((set) => set.id === id)
}

export const updateLastPracticed = (id, userId = null) => {
  try {
    const sets = getSavedVocabularySets(userId)
    const updated = sets.map((set) =>
      set.id === id ? { ...set, lastPracticed: new Date().toISOString() } : set
    )
    const storageKey = getStorageKey(userId)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Error updating last practiced:', error)
    return false
  }
}

const GUEST_ID = 'guest'

export const migrateGuestVocabularyToUser = (loggedInUserId) => {
  if (!loggedInUserId) return 0
  try {
    const guestKey = `kaqchikel_saved_vocabulary_${GUEST_ID}`
    const userKey = `kaqchikel_saved_vocabulary_${loggedInUserId}`
    const guestRaw = localStorage.getItem(guestKey)
    if (!guestRaw) return 0
    const guestSets = JSON.parse(guestRaw)
    if (!Array.isArray(guestSets) || guestSets.length === 0) return 0

    const userSets = JSON.parse(localStorage.getItem(userKey) || '[]')
    const existingIds = new Set(userSets.map((s) => s.id))
    const merged = [...userSets]

    for (const set of guestSets) {
      if (existingIds.has(set.id)) {
        merged.push({
          ...set,
          id: `${set.id}-import-${Date.now()}`,
          name: `${set.name || 'Conjunto'} (importado)`
        })
      } else {
        merged.push(set)
        existingIds.add(set.id)
      }
    }

    localStorage.setItem(userKey, JSON.stringify(merged))
    localStorage.removeItem(guestKey)
    return guestSets.length
  } catch (error) {
    console.error('migrateGuestVocabularyToUser:', error)
    return 0
  }
}
