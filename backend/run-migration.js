import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env'), override: true })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigration() {
  const client = await pool.connect()

  try {
    console.log('🔄 Running migration: 002_add_auth_and_subscriptions.sql')

    const sql = readFileSync(join(__dirname, 'migrations/002_add_auth_and_subscriptions.sql'), 'utf8')

    await client.query(sql)

    console.log('✅ Migration completed successfully!')
    console.log('   Created tables: users, subscriptions')
    console.log('   Added columns to audits: user_id, payment_type')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
