import pg from 'pg'

const { Pool } = pg

let pool = null

function isValidPostgresUrl(url) {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim().replace(/^["']|["']$/g, '')
  if (!trimmed) return false
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')
}

/** Works with Prisma Postgres (db.prisma.io), Neon, and standard Postgres URLs. */
export function getConnectionString() {
  const keys = [
    'POSTGRES_URL',
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
    'PRISMA_DATABASE_URL'
  ]
  for (const key of keys) {
    const value = process.env[key]
    if (isValidPostgresUrl(value)) {
      return value.trim().replace(/^["']|["']$/g, '')
    }
  }
  return null
}

export function isDbConfigured() {
  return Boolean(getConnectionString())
}

export function getPool() {
  if (!pool) {
    const connectionString = getConnectionString()
    if (!connectionString) {
      throw new Error('Database not configured. Set POSTGRES_URL on Vercel.')
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000
    })
  }
  return pool
}

export async function query(text, params = []) {
  const result = await getPool().query(text, params)
  return result.rows
}
