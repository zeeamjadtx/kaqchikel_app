import { verifyGoogleAccessToken, getBearerToken } from '../googleAuth.js'
import {
  isDbConfigured,
  ensureSchema,
  getLeaderboard,
  incrementStitch
} from '../db/leaderboardDb.js'

let schemaReady = false

async function ensureDbReady() {
  if (!isDbConfigured()) {
    throw new Error('Database not configured. Add Vercel Postgres to your project.')
  }
  if (!schemaReady) {
    await ensureSchema()
    schemaReady = true
  }
}

export async function handleLeaderboardGet() {
  if (!isDbConfigured()) {
    return { status: 503, body: { error: 'Database not configured', entries: [] } }
  }

  try {
    await ensureDbReady()
    const entries = await getLeaderboard(10)
    return { status: 200, body: { entries } }
  } catch (err) {
    console.error('handleLeaderboardGet:', err)
    return { status: 500, body: { error: err.message || 'Failed to load leaderboard', entries: [] } }
  }
}

export async function handleStitchPost(req) {
  if (!isDbConfigured()) {
    return { status: 503, body: { error: 'Database not configured' } }
  }

  const token = getBearerToken(req)
  const profile = await verifyGoogleAccessToken(token)
  if (!profile) {
    return { status: 401, body: { error: 'Invalid or unauthorized Google session' } }
  }

  try {
    await ensureDbReady()
    const result = await incrementStitch(profile)
    return {
      status: 200,
      body: {
        totalStitches: result.totalStitches,
        rateLimited: result.rateLimited || false,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          picture: profile.picture
        }
      }
    }
  } catch (err) {
    console.error('handleStitchPost:', err)
    return { status: 500, body: { error: err.message || 'Failed to save stitch' } }
  }
}
