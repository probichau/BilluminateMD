-- Migration: Add customer email to audits table
-- Date: 2026-01-24
-- Purpose: Store customer contact information for pay-per-use model

-- Add customer_email column
ALTER TABLE audits
ADD COLUMN customer_email VARCHAR(255);

-- Add index for support lookups (search by email)
CREATE INDEX idx_audits_customer_email ON audits(customer_email);

-- Add comment explaining the column
COMMENT ON COLUMN audits.customer_email IS 'Customer email collected during payment - used for receipts and support';
