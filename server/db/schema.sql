-- Run once in Vercel Postgres SQL console or: npm run db:init

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weaving_progress (
  user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  total_stitches INTEGER NOT NULL DEFAULT 0 CHECK (total_stitches >= 0),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weaving_progress_stitches
  ON weaving_progress (total_stitches DESC);
