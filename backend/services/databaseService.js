import pg from 'pg'
const { Pool } = pg

let pool

/**
 * Initialize database connection pool
 */
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase requires SSL even in development
      ssl: {
        rejectUnauthorized: false
      },
    })
  }
  return pool
}

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export async function initializeDatabase() {
  const client = await getPool().connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS audits (
        audit_id VARCHAR(255) PRIMARY KEY,
        file_url TEXT,
        provider_info JSONB,
        patient_info JSONB,
        service_info JSONB,
        financials JSONB,
        line_items JSONB,
        errors JSONB,
        is_paid BOOLEAN DEFAULT FALSE,
        payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
      CREATE INDEX IF NOT EXISTS idx_audits_is_paid ON audits(is_paid);
    `)

    console.log('Database schema initialized')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Store audit result in database
 */
export async function storeAuditResult(auditResult) {
  const client = await getPool().connect()

  try {
    await client.query(
      `INSERT INTO audits (
        audit_id, file_url, provider_info, patient_info, service_info,
        financials, line_items, errors, charity_analysis, savings, is_paid, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        auditResult.auditId,
        auditResult.fileUrl,
        JSON.stringify(auditResult.providerInfo),
        JSON.stringify(auditResult.patientInfo),
        JSON.stringify(auditResult.serviceInfo),
        JSON.stringify(auditResult.financials),
        JSON.stringify(auditResult.lineItems),
        JSON.stringify(auditResult.errors),
        JSON.stringify(auditResult.charityAnalysis || null),
        JSON.stringify(auditResult.savings || null),
        auditResult.isPaid,
        auditResult.createdAt,
      ]
    )

    console.log(`Audit ${auditResult.auditId} stored in database`)
  } catch (error) {
    console.error('Error storing audit result:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Retrieve audit by ID
 */
export async function getAuditById(auditId) {
  const client = await getPool().connect()

  try {
    const result = await client.query(
      'SELECT * FROM audits WHERE audit_id = $1',
      [auditId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]

    return {
      auditId: row.audit_id,
      fileUrl: row.file_url,
      providerInfo: row.provider_info,
      patientInfo: row.patient_info,
      serviceInfo: row.service_info,
      financials: row.financials,
      lineItems: row.line_items,
      errors: row.errors,
      charityAnalysis: row.charity_analysis,
      savings: row.savings,
      isPaid: row.is_paid,
      paymentIntentId: row.payment_intent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  } catch (error) {
    console.error('Error retrieving audit:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Mark audit as paid
 */
export async function markAuditAsPaid(auditId, paymentIntentId) {
  const client = await getPool().connect()

  try {
    await client.query(
      `UPDATE audits
       SET is_paid = TRUE,
           payment_intent_id = $1,
           updated_at = NOW()
       WHERE audit_id = $2`,
      [paymentIntentId, auditId]
    )

    console.log(`Audit ${auditId} marked as paid`)
  } catch (error) {
    console.error('Error marking audit as paid:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get audit statistics (optional - for future analytics)
 */
export async function getAuditStats() {
  const client = await getPool().connect()

  try {
    const result = await client.query(`
      SELECT
        COUNT(*) as total_audits,
        COUNT(*) FILTER (WHERE is_paid = TRUE) as paid_audits,
        AVG(jsonb_array_length(errors)) as avg_errors_found
      FROM audits
    `)

    return result.rows[0]
  } catch (error) {
    console.error('Error getting audit stats:', error)
    throw error
  } finally {
    client.release()
  }
}
