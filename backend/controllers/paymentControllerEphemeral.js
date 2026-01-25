/**
 * Ephemeral Payment Controller (HIPAA-Compliant)
 *
 * Handles payments for anonymous sessions (NO PHI).
 * Session IDs are stored, not audit IDs with PHI.
 */

import Stripe from 'stripe'
import { getSession, markSessionPaid } from '../services/sessionService.js'

let stripe = null

/**
 * Get or create Stripe client instance
 */
function getStripeClient() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripe
}

/**
 * POST /api/payment/create-intent-ephemeral
 *
 * Creates payment intent for anonymous session (NO PHI in metadata)
 */
export async function createPaymentIntentEphemeral(req, res) {
  try {
    const { sessionId, amount } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    // Validate session exists
    const session = getSession(sessionId)
    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired',
        details: 'Please start a new analysis',
      })
    }

    // Default to $49.00 if not specified
    const paymentAmount = amount || 4900 // cents

    console.log(`💳 Creating payment intent for session: ${sessionId}`)
    console.log(`   Amount: $${(paymentAmount / 100).toFixed(2)}`)

    // Create payment intent
    const stripeClient = getStripeClient()
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: paymentAmount,
      currency: 'usd',
      metadata: {
        sessionId, // Only session ID (NO PHI)
        paymentType: 'one_time',
        createdAt: new Date().toISOString(),
      },
      description: 'Medical Bill Analysis Report',
    })

    console.log(`✅ Payment intent created: ${paymentIntent.id}`)

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('❌ Error creating payment intent:', error)
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message,
    })
  }
}

/**
 * POST /api/payment/webhook-ephemeral
 *
 * Stripe webhook handler for ephemeral sessions
 * Marks session as paid when payment succeeds (NO PHI stored)
 */
export async function handleWebhookEphemeral(req, res) {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    const stripeClient = getStripeClient()
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      const sessionId = paymentIntent.metadata.sessionId

      console.log(`✅ Payment succeeded for session: ${sessionId}`)
      console.log(`   Payment Intent: ${paymentIntent.id}`)
      console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`)

      // Mark session as paid (NO PHI involved)
      const success = markSessionPaid(sessionId, paymentIntent.id)

      if (!success) {
        console.error(`⚠️  Could not mark session as paid (session may have expired): ${sessionId}`)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object
      const sessionId = paymentIntent.metadata.sessionId

      console.error(`❌ Payment failed for session: ${sessionId}`)
      console.error(`   Reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`)
      break
    }

    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
}

/**
 * POST /api/payment/verify-ephemeral
 *
 * Verifies payment status with Stripe and session
 */
export async function verifyPaymentEphemeral(req, res) {
  try {
    const { sessionId, paymentIntentId } = req.body

    if (!sessionId || !paymentIntentId) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'sessionId and paymentIntentId are required',
      })
    }

    console.log(`🔍 Verifying payment for session: ${sessionId}`)

    // Check session
    const session = getSession(sessionId)
    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired',
        paid: false,
      })
    }

    // Verify with Stripe
    const stripeClient = getStripeClient()
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId)

    const isPaid = paymentIntent.status === 'succeeded'

    // Update session if payment succeeded but session not marked
    if (isPaid && !session.paid) {
      markSessionPaid(sessionId, paymentIntentId)
    }

    console.log(`✅ Payment verification complete: ${isPaid ? 'PAID' : 'NOT PAID'}`)

    res.json({
      paid: isPaid,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    })
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    res.status(500).json({
      error: 'Failed to verify payment',
      details: error.message,
    })
  }
}
