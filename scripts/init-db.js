/**
 * Create leaderboard tables. Requires POSTGRES_URL in environment.
 * Vercel: copy POSTGRES_URL from project Storage → .env.local for local runs.
 */
import { ensureSchema, isDbConfigured } from '../server/db/leaderboardDb.js'

async function main() {
  if (!isDbConfigured()) {
    console.error('Missing POSTGRES_URL. Add it to .env.local or your shell environment.')
    process.exit(1)
  }

  await ensureSchema()
  console.log('Database schema ready (users, weaving_progress).')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
