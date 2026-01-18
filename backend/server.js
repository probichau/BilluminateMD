import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import auditRoutes from './routes/auditRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BilluminateMD API is running' })
})

// Routes
app.use('/api/audit', auditRoutes)
app.use('/api/payment', paymentRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})
