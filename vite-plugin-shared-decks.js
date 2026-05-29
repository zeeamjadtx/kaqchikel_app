import { loadPublishedDecks } from './server/loadPublishedDecks.js'

/** Read-only API: serves decks from data/vocabulary/ (backend files only). */
export function sharedDecksApi() {
  const middleware = async (req, res, next) => {
    const url = (req.url || '').split('?')[0]
    if (url !== '/api/shared-decks') {
      next()
      return
    }

    if (req.method === 'GET') {
      try {
        const decks = await loadPublishedDecks()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(decks))
      } catch (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: err.message || 'Failed to load decks' }))
      }
      return
    }

    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Decks are managed on the server. Add files to data/vocabulary/.' }))
  }

  return {
    name: 'shared-decks-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    }
  }
}
