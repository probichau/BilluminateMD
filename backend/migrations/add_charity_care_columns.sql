-- Add columns for charity care analysis and savings breakdown
-- Run this migration to add support for charity care eligibility tracking

ALTER TABLE audits
ADD COLUMN IF NOT EXISTS charity_analysis JSONB,
ADD COLUMN IF NOT EXISTS savings JSONB;

-- Update the table comment
COMMENT ON COLUMN audits.charity_analysis IS 'Charity care eligibility analysis including FPL data, IRS verification, and NPI lookup';
COMMENT ON COLUMN audits.savings IS 'Breakdown of savings: billing errors, charity care, and total';
