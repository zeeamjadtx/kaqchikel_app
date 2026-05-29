import { fetchPublishedDecks } from './publishedDecks'

/**
 * Mazos publicados para todos los usuarios.
 * Se cargan desde data/vocabulary/ en el servidor (no desde el navegador).
 */
export async function fetchSharedVocabularySets() {
  try {
    const list = await fetchPublishedDecks()
    return list.map((s) => ({
      ...s,
      totalCards: s.vocabulary.length,
      lastPracticed: null,
      fileName: `${s.id}.json`,
      isShared: true
    }))
  } catch (e) {
    console.error('fetchSharedVocabularySets:', e)
    return []
  }
}
