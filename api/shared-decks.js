import { loadPublishedDecks } from '../server/loadPublishedDecks.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const decks = await loadPublishedDecks()
      res.setHeader('Content-Type', 'application/json')
      res.status(200).json(decks)
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to load decks' })
    }
    return
  }

  res.setHeader('Allow', 'GET')
  res.status(405).json({
    error: 'Decks are managed on the server. Add CSV or JSON files to data/vocabulary/.'
  })
}
