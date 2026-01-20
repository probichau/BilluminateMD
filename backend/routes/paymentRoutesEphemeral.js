/**
 * Ephemeral Payment Routes (HIPAA-Compliant)
 *
 * Payment routes for anonymous sessions (NO PHI).
 */

import express from 'express'
import {
  createPaymentIntentEphemeral,
  handleWebhookEphemeral,
  verifyPaymentEphemeral,
} from '../controllers/paymentControllerEphemeral.js'

const router = express.Router()

// Create payment intent for session
router.post('/create-intent-ephemeral', createPaymentIntentEphemeral)

// Stripe webhook (raw body required)
router.post('/webhook-ephemeral', express.raw({ type: 'application/json' }), handleWebhookEphemeral)

// Verify payment
router.post('/verify-ephemeral', verifyPaymentEphemeral)

export default router
