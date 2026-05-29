const API_URL = '/api/shared-decks'

export const normalizePublishedList = (data) => {
  const list = Array.isArray(data) ? data : data?.decks
  if (!Array.isArray(list)) return []
  return list
    .filter((s) => s && Array.isArray(s.vocabulary) && s.vocabulary.length > 0)
    .map((s, i) => {
      const vocabulary = s.vocabulary.map((c) => ({
        term: typeof c.term === 'string' ? c.term : '',
        definition: typeof c.definition === 'string' ? c.definition : ''
      }))
      return {
        id: String(s.id || `shared-deck-${i}`),
        name: typeof s.name === 'string' && s.name.trim() ? s.name.trim() : 'Conjunto compartido',
        vocabulary,
        createdAt: s.createdAt || null
      }
    })
}

/** Load decks from the backend (data/vocabulary/ via API, static JSON as fallback). */
export async function fetchPublishedDecks() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return normalizePublishedList(data)
    }
  } catch (e) {
    console.warn('fetchPublishedDecks: API unavailable, using static file', e)
  }

  try {
    const res = await fetch('/shared-decks.json', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return normalizePublishedList(data)
  } catch (e) {
    console.error('fetchPublishedDecks:', e)
    return []
  }
}
