import { handleSessionPost } from '../../server/handlers/leaderboardHandlers.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { status, body } = await handleSessionPost(req)
  res.status(status).json(body)
}
