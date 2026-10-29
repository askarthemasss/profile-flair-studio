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

-- Enable RLS
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Public read for snapshots
CREATE POLICY "Public read snapshots" ON snapshots FOR SELECT USING (true);
