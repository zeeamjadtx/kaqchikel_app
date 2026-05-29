import { loadEnv } from 'vite'
import { loadPublishedDecks } from './server/loadPublishedDecks.js'
import { handleLeaderboardGet, handleStitchPost } from './server/handlers/leaderboardHandlers.js'

function applyEnv(mode, root) {
  const env = loadEnv(mode, root, '')
  for (const [key, value] of Object.entries(env)) {
    if (value != null && value !== '') {
      process.env[key] = value
    }
  }
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/** Dev/preview API: shared decks, leaderboard, stitch sync. */
export function apiRoutes() {
  const middleware = async (req, res, next) => {
    const url = (req.url || '').split('?')[0]

    if (url === '/api/shared-decks') {
      if (req.method === 'GET') {
        try {
          const decks = await loadPublishedDecks()
          sendJson(res, 200, decks)
        } catch (err) {
          sendJson(res, 500, { error: err.message || 'Failed to load decks' })
        }
        return
      }
      sendJson(res, 405, { error: 'Decks are managed on the server. Add files to data/vocabulary/.' })
      return
    }

    if (url === '/api/leaderboard' && req.method === 'GET') {
      const { status, body } = await handleLeaderboardGet()
      sendJson(res, status, body)
      return
    }

    if (url === '/api/progress/stitch' && req.method === 'POST') {
      const { status, body } = await handleStitchPost(req)
      sendJson(res, status, body)
      return
    }

    next()
  }

  return {
    name: 'kaqchikel-api',
    configureServer(server) {
      applyEnv(server.config.mode, server.config.root)
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      applyEnv(server.config.mode, server.config.root)
      server.middlewares.use(middleware)
    }
  }
}
