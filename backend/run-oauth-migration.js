import pg from 'pg'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function runMigration() {
  try {
    const sql = fs.readFileSync('./migrations/add_google_oauth.sql', 'utf8')
    console.log('🔄 Running OAuth migration...')
    await pool.query(sql)
    console.log('✅ OAuth migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
