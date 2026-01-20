/**
 * Session Management Service
 *
 * Manages anonymous sessions for HIPAA-compliant ephemeral processing.
 * NO PHI is stored - only session IDs and payment status.
 *
 * Sessions expire after 24 hours and are cleared on server restart.
 */

import { v4 as uuidv4 } from 'uuid'

// In-memory session store (NO PHI)
const sessions = new Map()

// Session expiration time (24 hours in milliseconds)
const SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000

/**
 * Create a new anonymous session
 * @returns {string} sessionId - UUID v4
 */
export function createSession() {
  const sessionId = uuidv4()
  const expiresAt = Date.now() + SESSION_EXPIRATION_MS

  sessions.set(sessionId, {
    paid: false,
    paymentIntentId: null,
    createdAt: Date.now(),
    expiresAt,
  })

  console.log(`📝 Created session: ${sessionId}`)
  return sessionId
}

/**
 * Get session data
 * @param {string} sessionId
 * @returns {object|null} Session data or null if not found/expired
 */
export function getSession(sessionId) {
  if (!sessionId) {
    return null
  }

  const session = sessions.get(sessionId)

  if (!session) {
    return null
  }

  // Check if expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId)
    console.log(`🗑️  Session expired and deleted: ${sessionId}`)
    return null
  }

  return session
}

/**
 * Mark session as paid
 * @param {string} sessionId
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {boolean} Success
 */
export function markSessionPaid(sessionId, paymentIntentId) {
  const session = getSession(sessionId)

  if (!session) {
    console.error(`❌ Cannot mark session as paid: session not found (${sessionId})`)
    return false
  }

  session.paid = true
  session.paymentIntentId = paymentIntentId
  session.paidAt = Date.now()

  sessions.set(sessionId, session)
  console.log(`✅ Session marked as paid: ${sessionId}`)
  return true
}

/**
 * Verify if session is paid
 * @param {string} sessionId
 * @returns {boolean} True if session is paid
 */
export function isSessionPaid(sessionId) {
  const session = getSession(sessionId)
  return session ? session.paid : false
}

/**
 * Delete a session
 * @param {string} sessionId
 */
export function deleteSession(sessionId) {
  const deleted = sessions.delete(sessionId)
  if (deleted) {
    console.log(`🗑️  Session deleted: ${sessionId}`)
  }
  return deleted
}

/**
 * Cleanup expired sessions
 * Called periodically to free memory
 */
export function cleanupExpiredSessions() {
  const now = Date.now()
  let cleaned = 0

  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired session(s)`)
  }

  return cleaned
}

/**
 * Get session statistics (for monitoring)
 * @returns {object} Stats
 */
export function getSessionStats() {
  const total = sessions.size
  let paid = 0
  let unpaid = 0

  for (const session of sessions.values()) {
    if (session.paid) {
      paid++
    } else {
      unpaid++
    }
  }

  return {
    total,
    paid,
    unpaid,
    memoryUsage: process.memoryUsage().heapUsed,
  }
}

// Start periodic cleanup (every hour)
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL_MS)

console.log('📝 Session service initialized (in-memory, ephemeral)')
