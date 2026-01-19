-- Migration: Add intermediate_audits table for storing data between upload and financial info submission
-- This replaces in-memory storage and persists across server restarts

CREATE TABLE IF NOT EXISTS intermediate_audits (
  audit_id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_intermediate_audits_created_at ON intermediate_audits(created_at);

-- Add comment
COMMENT ON TABLE intermediate_audits IS 'Temporary storage for audit data before financial information is submitted';
