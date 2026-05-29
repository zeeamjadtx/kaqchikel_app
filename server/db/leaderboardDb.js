import { sql } from '@vercel/postgres'

const STITCH_COOLDOWN_MS = 3000

export function isDbConfigured() {
  return Boolean(process.env.POSTGRES_URL)
}

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      picture TEXT,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS weaving_progress (
      user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
      total_stitches INTEGER NOT NULL DEFAULT 0,
      last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function upsertUser(profile) {
  await sql`
    INSERT INTO users (id, email, name, picture, first_seen_at, last_seen_at)
    VALUES (
      ${profile.id},
      ${profile.email},
      ${profile.name},
      ${profile.picture},
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      picture = EXCLUDED.picture,
      last_seen_at = NOW()
  `
}

function mapUserRow(row) {
  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture
    },
    totalStitches: Number(row.total_stitches) || 0,
    lastUpdated: row.last_updated_at
      ? new Date(row.last_updated_at).toISOString()
      : null,
    firstSeen: row.first_seen_at
      ? new Date(row.first_seen_at).toISOString()
      : null,
    lastSeen: row.last_seen_at
      ? new Date(row.last_seen_at).toISOString()
      : null
  }
}

/** All signed-in students (including 0 puntadas), sorted by score then recent activity. */
export async function getLeaderboard(limit = 50) {
  const { rows } = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      u.picture,
      u.first_seen_at,
      u.last_seen_at,
      COALESCE(wp.total_stitches, 0) AS total_stitches,
      COALESCE(wp.last_updated_at, u.last_seen_at) AS last_updated_at
    FROM users u
    LEFT JOIN weaving_progress wp ON wp.user_id = u.id
    ORDER BY COALESCE(wp.total_stitches, 0) DESC, u.last_seen_at DESC
    LIMIT ${limit}
  `

  return rows.map(mapUserRow)
}

export async function getAllUsers(limit = 200) {
  const { rows } = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      u.picture,
      u.first_seen_at,
      u.last_seen_at,
      COALESCE(wp.total_stitches, 0) AS total_stitches,
      COALESCE(wp.last_updated_at, u.last_seen_at) AS last_updated_at
    FROM users u
    LEFT JOIN weaving_progress wp ON wp.user_id = u.id
    ORDER BY u.last_seen_at DESC
    LIMIT ${limit}
  `

  return rows.map(mapUserRow)
}

export async function registerUser(profile) {
  await upsertUser(profile)
}

export async function incrementStitch(profile) {
  await upsertUser(profile)

  const existing = await sql`
    SELECT total_stitches, last_updated_at
    FROM weaving_progress
    WHERE user_id = ${profile.id}
  `

  const row = existing.rows[0]
  if (row?.last_updated_at) {
    const elapsed = Date.now() - new Date(row.last_updated_at).getTime()
    if (elapsed < STITCH_COOLDOWN_MS) {
      return {
        totalStitches: Number(row.total_stitches) || 0,
        rateLimited: true
      }
    }
  }

  if (!row) {
    await sql`
      INSERT INTO weaving_progress (user_id, total_stitches, last_updated_at)
      VALUES (${profile.id}, 1, NOW())
    `
    return { totalStitches: 1, rateLimited: false }
  }

  const { rows } = await sql`
    UPDATE weaving_progress
    SET
      total_stitches = total_stitches + 1,
      last_updated_at = NOW()
    WHERE user_id = ${profile.id}
    RETURNING total_stitches, last_updated_at
  `

  return {
    totalStitches: Number(rows[0]?.total_stitches) || 0,
    rateLimited: false
  }
}
