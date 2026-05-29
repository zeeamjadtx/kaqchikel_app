import { neon } from '@neondatabase/serverless'

let sql = null

/** Pooled URL for Vercel serverless (not POSTGRES_URL_NON_POOLING). */
export function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || null
}

export function isDbConfigured() {
  return Boolean(getConnectionString())
}

export function getSql() {
  if (!sql) {
    const connectionString = getConnectionString()
    if (!connectionString) {
      throw new Error('Database not configured. Set POSTGRES_URL on Vercel.')
    }
    sql = neon(connectionString)
  }
  return sql
}
