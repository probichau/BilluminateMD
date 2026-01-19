/**
 * Subscription Controller
 * Handles subscription-related endpoints
 */

import {
  createSubscriptionCheckout,
  hasActiveSubscription,
  getUserSubscription,
  cancelSubscription,
  unlockExistingAudits,
  handleSubscriptionSuccess,
  handleSubscriptionUpdate,
  handleSubscriptionCanceled,
} from '../services/subscriptionService.js'
import Stripe from 'stripe'

// Lazy Stripe initialization
let stripe = null
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
 * Create subscription checkout session
 * POST /api/subscription/create-checkout
 */
export async function createCheckout(req, res) {
  try {
    const userId = req.user.id
    const email = req.user.email

    const result = await createSubscriptionCheckout(userId, email)

    res.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    })
  } catch (error) {
    console.error('Create checkout error:', error)
    res.status(500).json({
      error: 'Failed to create checkout session',
    })
  }
}

/**
 * Check subscription status
 * GET /api/subscription/status
 */
export async function checkStatus(req, res) {
  try {
    const userId = req.user.id

    const hasActive = await hasActiveSubscription(userId)
    const subscription = await getUserSubscription(userId)

    res.json({
      success: true,
      hasActiveSubscription: hasActive,
      subscription: subscription
        ? {
            planType: subscription.plan_type,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
          }
        : null,
    })
  } catch (error) {
    console.error('Check status error:', error)
    res.status(500).json({
      error: 'Failed to check subscription status',
    })
  }
}

/**
 * Cancel subscription
 * POST /api/subscription/cancel
 */
export async function cancel(req, res) {
  try {
    const userId = req.user.id

    await cancelSubscription(userId)

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)

    if (error.message === 'No active subscription found') {
      return res.status(404).json({ error: error.message })
    }

    res.status(500).json({
      error: 'Failed to cancel subscription',
    })
  }
}

/**
 * Verify Stripe checkout session and create subscription
 * POST /api/subscription/verify-session
 */
export async function verifySession(req, res) {
  try {
    const userId = req.user.id
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    // Retrieve the session from Stripe
    const session = await getStripeClient().checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    if (session.mode !== 'subscription') {
      return res.status(400).json({ error: 'Not a subscription session' })
    }

    // Manually trigger subscription creation (normally done by webhook)
    await handleSubscriptionSuccess(session)

    res.json({
      success: true,
      message: 'Subscription verified and activated',
    })
  } catch (error) {
    console.error('Verify session error:', error)
    res.status(500).json({
      error: 'Failed to verify session',
    })
  }
}

/**
 * Unlock existing audits for subscribed user
 * POST /api/subscription/unlock-existing
 */
export async function unlockExisting(req, res) {
  try {
    const userId = req.user.id

    const unlockedCount = await unlockExistingAudits(userId)

    res.json({
      success: true,
      unlockedCount,
      message: `Unlocked ${unlockedCount} existing audit(s)`,
    })
  } catch (error) {
    console.error('Unlock existing audits error:', error)

    if (error.message === 'No active subscription found') {
      return res.status(403).json({ error: error.message })
    }

    res.status(500).json({
      error: 'Failed to unlock existing audits',
    })
  }
}

/**
 * Webhook handler for Stripe events
 * POST /api/subscription/webhook
 */
export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    // Verify webhook signature
    event = getStripeClient().webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        if (session.mode === 'subscription') {
          await handleSubscriptionSuccess(session)
        }
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    res.status(500).json({
      error: 'Webhook handler failed',
    })
  }
}
