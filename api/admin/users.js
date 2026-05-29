import { handleAdminUsersGet } from '../../server/handlers/leaderboardHandlers.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { status, body } = await handleAdminUsersGet(req)
  res.status(status).json(body)
}
