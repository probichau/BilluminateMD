/**
 * Session Storage Utility (HIPAA-Compliant Client-Side Storage)
 *
 * Stores all PHI in browser sessionStorage only.
 * Data is automatically deleted when browser closes.
 * NO data sent to server except during API calls.
 */

const STORAGE_KEYS = {
  SESSION_ID: 'billuminatemd_session_id',
  ANALYZED_BILL: 'billuminatemd_analyzed_bill',
  PAYMENT_STATUS: 'billuminatemd_payment_status',
}

/**
 * Save session ID
 */
export function saveSessionId(sessionId) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
    console.log('📝 Session ID saved to browser')
  } catch (error) {
    console.error('Failed to save session ID:', error)
  }
}

/**
 * Get session ID
 */
export function getSessionId() {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)
  } catch (error) {
    console.error('Failed to get session ID:', error)
    return null
  }
}

/**
 * Save analyzed bill data
 */
export function saveAnalyzedBill(data) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.ANALYZED_BILL, JSON.stringify(data))
    console.log('📝 Analyzed bill saved to browser')
    console.log('   Data will be deleted when you close the browser')
  } catch (error) {
    console.error('Failed to save analyzed bill:', error)
    throw new Error('Failed to save data locally. Please try again.')
  }
}

/**
 * Get analyzed bill data
 */
export function getAnalyzedBill() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.ANALYZED_BILL)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to get analyzed bill:', error)
    return null
  }
}

/**
 * Update analyzed bill with charity analysis
 */
export function updateCharityAnalysis(charityAnalysis) {
  try {
    const bill = getAnalyzedBill()
    if (bill) {
      bill.analyzedData.charityAnalysis = charityAnalysis
      saveAnalyzedBill(bill)
      console.log('📝 Charity analysis updated in browser storage')
    }
  } catch (error) {
    console.error('Failed to update charity analysis:', error)
  }
}

/**
 * Save payment status
 */
export function savePaymentStatus(paymentData) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.PAYMENT_STATUS, JSON.stringify(paymentData))
    console.log('📝 Payment status saved to browser')

    // Also update analyzed bill if it exists
    const bill = getAnalyzedBill()
    if (bill) {
      bill.isPaid = paymentData.isPaid
      bill.paymentIntentId = paymentData.paymentIntentId
      saveAnalyzedBill(bill)
    }
  } catch (error) {
    console.error('Failed to save payment status:', error)
  }
}

/**
 * Get payment status
 */
export function getPaymentStatus() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.PAYMENT_STATUS)
    return data ? JSON.parse(data) : { isPaid: false }
  } catch (error) {
    console.error('Failed to get payment status:', error)
    return { isPaid: false }
  }
}

/**
 * Check if user is paid
 */
export function isPaid() {
  const status = getPaymentStatus()
  return status.isPaid === true
}

/**
 * Clear all session data
 */
export function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID)
    sessionStorage.removeItem(STORAGE_KEYS.ANALYZED_BILL)
    sessionStorage.removeItem(STORAGE_KEYS.PAYMENT_STATUS)
    console.log('🗑️  Session data cleared from browser')
  } catch (error) {
    console.error('Failed to clear session:', error)
  }
}

/**
 * Check if session exists
 */
export function hasSession() {
  return !!getSessionId() && !!getAnalyzedBill()
}

/**
 * Get session age (for expiration warnings)
 */
export function getSessionAge() {
  const bill = getAnalyzedBill()
  if (!bill || !bill.createdAt) {
    return null
  }

  const now = Date.now()
  const created = new Date(bill.createdAt).getTime()
  const ageMs = now - created

  return {
    ageMs,
    ageHours: ageMs / (1000 * 60 * 60),
    expiresInHours: 24 - ageMs / (1000 * 60 * 60),
  }
}

/**
 * Check if session is expired (24 hours)
 */
export function isSessionExpired() {
  const age = getSessionAge()
  if (!age) {
    return false
  }
  return age.ageHours >= 24
}

/**
 * Export session data for download (backup)
 */
export function exportSessionData() {
  try {
    const data = {
      sessionId: getSessionId(),
      analyzedBill: getAnalyzedBill(),
      paymentStatus: getPaymentStatus(),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billuminatemd-session-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    console.log('📥 Session data exported')
  } catch (error) {
    console.error('Failed to export session data:', error)
  }
}

/**
 * Get session statistics
 */
export function getSessionStats() {
  const hasSessionData = hasSession()
  const paymentData = getPaymentStatus()
  const age = getSessionAge()

  return {
    hasSession: hasSessionData,
    sessionId: getSessionId(),
    isPaid: paymentData.isPaid,
    age: age ? `${age.ageHours.toFixed(1)} hours` : 'N/A',
    expiresIn: age ? `${age.expiresInHours.toFixed(1)} hours` : 'N/A',
    isExpired: isSessionExpired(),
  }
}

// Log session info on load (for debugging)
if (typeof window !== 'undefined') {
  const stats = getSessionStats()
  console.log('📊 Session Storage Status:', stats)

  // Warn if session is close to expiring
  if (stats.age && stats.age.expiresInHours < 2) {
    console.warn(`⚠️  Session expires in ${stats.expiresInHours.toFixed(1)} hours`)
    console.warn('   Download your results if you need to keep them')
  }
}
