import { neon, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Required for Vercel Node.js serverless functions (not Edge)
neonConfig.webSocketConstructor = ws

let sql = null

function isValidPostgresUrl(url) {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim().replace(/^["']|["']$/g, '')
  if (!trimmed) return false
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')
}

/** Prefer pooled URL (hostname often contains -pooler). */
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

export function getSql() {
  if (!sql) {
    const connectionString = getConnectionString()
    if (!connectionString) {
      throw new Error(
        'Database not configured. Set POSTGRES_URL (pooled) on Vercel Storage.'
      )
    }
    sql = neon(connectionString)
  }
  return sql
}
