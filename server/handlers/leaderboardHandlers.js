import { verifyGoogleAccessToken, getBearerToken } from '../googleAuth.js'
import { isAdminEmail } from '../adminAuth.js'
import {
  isDbConfigured,
  ensureSchema,
  getLeaderboard,
  getAllUsers,
  registerUser,
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
    const entries = await getLeaderboard(50)
    return { status: 200, body: { entries } }
  } catch (err) {
    console.error('handleLeaderboardGet:', err)
    const msg = err.message || ''
    const isDb =
      msg.includes('connection') ||
      msg.includes('POSTGRES') ||
      msg.includes('Database not configured')
    return {
      status: isDb ? 503 : 500,
      body: { error: err.message || 'Failed to load leaderboard', entries: [] }
    }
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

/** Record student on sign-in so they appear before earning a stitch. */
export async function handleSessionPost(req) {
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
    await registerUser(profile)
    return {
      status: 200,
      body: {
        ok: true,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          picture: profile.picture
        }
      }
    }
  } catch (err) {
    console.error('handleSessionPost:', err)
    return { status: 500, body: { error: err.message || 'Failed to register session' } }
  }
}

export async function handleAdminUsersGet(req) {
  if (!isDbConfigured()) {
    return { status: 503, body: { error: 'Database not configured', users: [] } }
  }

  const token = getBearerToken(req)
  const profile = await verifyGoogleAccessToken(token)
  if (!profile) {
    return { status: 401, body: { error: 'Unauthorized', users: [] } }
  }
  if (!isAdminEmail(profile.email)) {
    return { status: 403, body: { error: 'Admin access required', users: [] } }
  }

  try {
    await ensureDbReady()
    const users = await getAllUsers(200)
    return { status: 200, body: { users } }
  } catch (err) {
    console.error('handleAdminUsersGet:', err)
    return { status: 500, body: { error: err.message || 'Failed to load users', users: [] } }
  }
}
