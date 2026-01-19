import { initializeDatabase } from './services/databaseService.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('🔄 Starting database migration...')
console.log(`📊 Database: ${process.env.DATABASE_URL?.substring(0, 30)}...`)

try {
  await initializeDatabase()
  console.log('✅ Database migration completed successfully!')
  console.log('\n📋 Tables created:')
  console.log('   - audits (with indexes on created_at and is_paid)')
  console.log('\n✨ Your database is ready to use!')
  process.exit(0)
} catch (error) {
  console.error('❌ Database migration failed:', error.message)
  console.error('\n🔍 Troubleshooting:')
  console.error('   1. Check your DATABASE_URL in .env is correct')
  console.error('   2. Verify your Supabase project is active')
  console.error('   3. Check your database password is correct')
  console.error('   4. Ensure SSL is configured properly')
  process.exit(1)
}
