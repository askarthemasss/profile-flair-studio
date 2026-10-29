-- =============================================================================
-- Sigil Database Schema Migration 0001
-- =============================================================================

-- Snapshots: cached GitHub metrics and contribution graphs
CREATE TABLE IF NOT EXISTS snapshots (
  login TEXT PRIMARY KEY,
  github_id BIGINT,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_fetched_at ON snapshots(fetched_at);

-- User tokens: encrypted GitHub OAuth tokens for higher rate limits
CREATE TABLE IF NOT EXISTS user_tokens (
  login TEXT PRIMARY KEY,
  encrypted_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opt-outs: users who requested total privacy / suppression of cards
CREATE TABLE IF NOT EXISTS opt_outs (
  login TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved presets: user-configured flair card combinations and overrides
CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  preset JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);

-- Theme votes: community theme gallery upvotes
CREATE TABLE IF NOT EXISTS theme_votes (
  theme_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (theme_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_theme_votes_theme_id ON theme_votes(theme_id);

-- Enable RLS
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_votes ENABLE ROW LEVEL SECURITY;

-- Public read for snapshots
CREATE POLICY "Public read snapshots" ON snapshots FOR SELECT USING (true);

-- Public read for opt_outs
CREATE POLICY "Public read opt_outs" ON opt_outs FOR SELECT USING (true);
