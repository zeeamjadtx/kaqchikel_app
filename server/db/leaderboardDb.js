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

export async function getLeaderboard(limit = 10) {
  const { rows } = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      u.picture,
      wp.total_stitches,
      wp.last_updated_at
    FROM weaving_progress wp
    INNER JOIN users u ON u.id = wp.user_id
    WHERE wp.total_stitches > 0
    ORDER BY wp.total_stitches DESC, wp.last_updated_at ASC
    LIMIT ${limit}
  `

  return rows.map((row) => ({
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture
    },
    totalStitches: Number(row.total_stitches) || 0,
    lastUpdated: row.last_updated_at
      ? new Date(row.last_updated_at).toISOString()
      : null
  }))
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
