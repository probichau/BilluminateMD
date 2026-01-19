/**
 * Subscription Routes
 */

import express from 'express'
import {
  createCheckout,
  checkStatus,
  cancel,
  verifySession,
  unlockExisting,
  handleWebhook,
} from '../controllers/subscriptionController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Webhook route (must be before express.json() middleware)
// Note: This route needs raw body, so it should be registered in server.js with express.raw()
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

// Protected routes
router.post('/create-checkout', authenticateToken, createCheckout)
router.get('/status', authenticateToken, checkStatus)
router.post('/cancel', authenticateToken, cancel)
router.post('/verify-session', authenticateToken, verifySession)
router.post('/unlock-existing', authenticateToken, unlockExisting)

export default router
