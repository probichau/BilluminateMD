import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import passport from 'passport'
import auditRoutes from './routes/auditRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import authRoutes from './routes/authRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'

// Get current directory for ES6 modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables with explicit path and override any existing ones
dotenv.config({ path: join(__dirname, '.env'), override: true })

// Verify critical environment variables are loaded
console.log('🔐 Environment variables loaded:')
console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing')
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing')
console.log('  STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing')
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '⚠️  Using default (change in production)')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://main.d83mc8ny8u2m7.amplifyapp.com',
    'https://app.billuminate.com',
    'https://staging.d83mc8ny8u2m7.amplifyapp.com'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BilluminateMD API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/payment', paymentRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Express error handler caught:', err)
  console.error('Error stack:', err.stack)

  // Make sure we always send a valid JSON response
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      details: err.toString()
    })
  }
})

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise)
  console.error('Reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  console.error('Stack:', error.stack)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`💡 Ready to process bills!`)
})
