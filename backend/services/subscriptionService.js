/**
 * Subscription Service
 * Handles Stripe subscription creation and management
 */

import Stripe from 'stripe'
import pg from 'pg'

const { Pool } = pg

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

// Database pool
let pool
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  }
  return pool
}

// Helper function for queries
async function query(text, params) {
  return await getPool().query(text, params)
}

// Pricing configuration
export const PRICING = {
  PER_BILL: {
    amount: 4900, // $49.00 in cents
    currency: 'usd',
    type: 'one_time',
  },
  UNLIMITED_ANNUAL: {
    amount: 9997, // $99.97 in cents
    currency: 'usd',
    type: 'subscription',
    interval: 'year',
    priceId: process.env.STRIPE_UNLIMITED_ANNUAL_PRICE_ID, // Set this in Stripe dashboard
  },
}

/**
 * Create a Stripe customer for a user
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<string>} Stripe customer ID
 */
async function createStripeCustomer(userId, email) {
  const customer = await getStripeClient().customers.create({
    email,
    metadata: {
      userId: userId.toString(),
    },
  })

  return customer.id
}

/**
 * Get or create Stripe customer ID for user
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<string>} Stripe customer ID
 */
async function getOrCreateStripeCustomer(userId, email) {
  // Check if user has an active subscription with customer ID
  const result = await query(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL LIMIT 1',
    [userId]
  )

  if (result.rows.length > 0) {
    return result.rows[0].stripe_customer_id
  }

  // Create new customer
  return await createStripeCustomer(userId, email)
}

/**
 * Create a subscription checkout session
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<Object>} Checkout session object
 */
export async function createSubscriptionCheckout(userId, email) {
  const customerId = await getOrCreateStripeCustomer(userId, email)

  // Create checkout session
  const session = await getStripeClient().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: PRICING.UNLIMITED_ANNUAL.currency,
          product_data: {
            name: 'BilluminateMD Unlimited Annual',
            description: 'Unlimited medical bill audits for 1 year',
          },
          unit_amount: PRICING.UNLIMITED_ANNUAL.amount,
          recurring: {
            interval: PRICING.UNLIMITED_ANNUAL.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
    metadata: {
      userId: userId.toString(),
    },
  })

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Handle successful subscription checkout (called by webhook)
 * @param {Object} session - Stripe checkout session
 */
export async function handleSubscriptionSuccess(session) {
  const userId = parseInt(session.metadata.userId)
  const customerId = session.customer
  const subscriptionId = session.subscription

  // Get subscription details
  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId)

  // Save subscription to database
  await query(
    `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, plan_type, status, current_period_start, current_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (stripe_subscription_id)
     DO UPDATE SET
       status = $5,
       current_period_start = $6,
       current_period_end = $7,
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      subscriptionId,
      customerId,
      'unlimited_annual',
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
    ]
  )

  console.log(`✅ Subscription created for user ${userId}`)

  // Unlock all existing audits for this user where the patient name matches
  try {
    const { getUserById } = await import('./authService.js')
    const { doesBillMatchUser } = await import('./nameMatchingService.js')

    const user = await getUserById(userId)
    if (!user) {
      console.warn(`⚠️  User ${userId} not found, cannot unlock existing audits`)
      return
    }

    // Get all unpaid audits for this user
    const audits = await query(
      `SELECT id, extracted_data FROM audits WHERE user_id = $1 AND is_paid = FALSE`,
      [userId]
    )

    let unlockedCount = 0
    for (const audit of audits.rows) {
      const patientName = audit.extracted_data?.patientInfo?.name || ''
      if (doesBillMatchUser(patientName, user.fullName)) {
        await query(
          `UPDATE audits SET is_paid = TRUE, payment_type = 'subscription', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [audit.id]
        )
        unlockedCount++
      }
    }

    console.log(`✅ Unlocked ${unlockedCount} existing audit(s) for user ${userId}`)
  } catch (error) {
    console.error('Error unlocking existing audits:', error)
    // Don't throw - subscription was created successfully, this is just a bonus feature
  }
}

/**
 * Handle subscription update (called by webhook)
 * @param {Object} subscription - Stripe subscription object
 */
export async function handleSubscriptionUpdate(subscription) {
  await query(
    `UPDATE subscriptions
     SET status = $1,
         current_period_start = $2,
         current_period_end = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $4`,
    [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.id,
    ]
  )

  console.log(`✅ Subscription ${subscription.id} updated to status: ${subscription.status}`)
}

/**
 * Handle subscription cancellation (called by webhook)
 * @param {Object} subscription - Stripe subscription object
 */
export async function handleSubscriptionCanceled(subscription) {
  await query(
    `UPDATE subscriptions
     SET status = 'canceled',
         updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  )

  console.log(`✅ Subscription ${subscription.id} canceled`)
}

/**
 * Check if user has active subscription
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if user has active subscription
 */
export async function hasActiveSubscription(userId) {
  const result = await query(
    `SELECT id FROM subscriptions
     WHERE user_id = $1
       AND status = 'active'
       AND current_period_end > CURRENT_TIMESTAMP`,
    [userId]
  )

  return result.rows.length > 0
}

/**
 * Get user's subscription details
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} Subscription object or null
 */
export async function getUserSubscription(userId) {
  const result = await query(
    `SELECT * FROM subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  )

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0]
}

/**
 * Cancel subscription
 * @param {number} userId - User ID
 */
export async function cancelSubscription(userId) {
  const subscription = await getUserSubscription(userId)

  if (!subscription || subscription.status !== 'active') {
    throw new Error('No active subscription found')
  }

  // Cancel at period end (don't cancel immediately)
  await getStripeClient().subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  console.log(`✅ Subscription ${subscription.stripe_subscription_id} will cancel at period end`)
}

/**
 * Unlock existing audits for a subscribed user
 * Called after subscription creation to retroactively unlock matching audits
 * @param {number} userId - User ID
 * @returns {Promise<number>} Number of audits unlocked
 */
export async function unlockExistingAudits(userId) {
  const { getUserById } = await import('./authService.js')
  const { doesBillMatchUser } = await import('./nameMatchingService.js')

  console.log(`🔓 Starting unlock process for user ${userId}`)

  const user = await getUserById(userId)
  if (!user) {
    console.error(`❌ User ${userId} not found`)
    throw new Error('User not found')
  }
  console.log(`👤 User found: ${user.fullName} (${user.email})`)

  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription(userId)
  console.log(`📊 Has active subscription: ${hasSubscription}`)

  if (!hasSubscription) {
    console.error(`❌ No active subscription found for user ${userId}`)
    throw new Error('No active subscription found')
  }

  // Get all unpaid audits for this user
  const audits = await query(
    `SELECT id, extracted_data FROM audits WHERE user_id = $1 AND is_paid = FALSE`,
    [userId]
  )
  console.log(`📋 Found ${audits.rows.length} unpaid audit(s)`)

  let unlockedCount = 0
  for (const audit of audits.rows) {
    const patientName = audit.extracted_data?.patientInfo?.name || ''
    console.log(`🔍 Checking audit ${audit.id}: patient="${patientName}", user="${user.fullName}"`)

    if (doesBillMatchUser(patientName, user.fullName)) {
      console.log(`✅ Names match! Unlocking audit ${audit.id}`)
      await query(
        `UPDATE audits SET is_paid = TRUE, payment_type = 'subscription', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [audit.id]
      )
      unlockedCount++
    } else {
      console.log(`❌ Names don't match for audit ${audit.id}`)
    }
  }

  console.log(`✅ Unlocked ${unlockedCount} existing audit(s) for user ${userId}`)
  return unlockedCount
}
