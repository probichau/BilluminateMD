/**
 * Payment Choice Modal
 * Shows user two options when they want to unlock their report:
 * 1. Pay $29.99 one-time for this bill
 * 2. Subscribe for $99.97/year unlimited bills
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL, REPORT_PRICE, SUBSCRIPTION_PRICE } from '../config'
import PaymentModal from './PaymentModal'

export default function PaymentChoiceModal({ auditId, totalSavings, onClose, onSuccess }) {
  const navigate = useNavigate()
  const { isAuthenticated, hasActiveSubscription } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setError('')
    setSubscribing(true)

    try {
      // ALWAYS save the audit ID so we can return to it after subscription
      console.log('💾 Saving pending audit ID to localStorage:', auditId)
      localStorage.setItem('pendingAuditId', auditId)
      console.log('✅ Saved! Verification:', localStorage.getItem('pendingAuditId'))

      if (!isAuthenticated) {
        // Save current location and redirect to register
        navigate('/register', {
          state: {
            from: window.location.pathname,
            wantsSubscription: true,
            message: 'Create an account to subscribe for unlimited bill audits',
          },
        })
        return
      }

      // Create subscription checkout session
      const response = await fetch(`${API_URL}/api/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setSubscribing(false)
    }
  }

  function handleOneTimePurchase() {
    setShowPaymentModal(true)
  }

  if (showPaymentModal) {
    return (
      <PaymentModal
        auditId={auditId}
        amount={REPORT_PRICE}
        onSuccess={onSuccess}
        onClose={() => {
          setShowPaymentModal(false)
          onClose()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold mb-2">Unlock Your Full Report</h2>
          <p className="text-blue-100">
            You could save ${totalSavings.toFixed(2)} on this bill. Choose your unlock option:
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Already Subscribed Notice */}
        {hasActiveSubscription && (
          <div className="mx-6 mt-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl text-center">
            <p className="font-semibold mb-2">✅ You already have an unlimited subscription!</p>
            <p className="text-sm">
              This report should have been auto-unlocked. Please refresh the page or contact
              support.
            </p>
          </div>
        )}

        {/* Payment Options */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* One-Time Purchase */}
            <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 transition">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">One-Time Purchase</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-blue-600">${REPORT_PRICE}</span>
                </div>
                <p className="text-slate-600 text-sm">For this bill only</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">Full audit report with all errors</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">Charity care eligibility analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">Professional appeal letter</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">No account required</span>
                </li>
              </ul>

              <button
                onClick={handleOneTimePurchase}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Pay ${REPORT_PRICE}
              </button>
            </div>

            {/* Subscription */}
            <div className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 relative">
              {/* Best Value Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-xs shadow-md">
                  BEST VALUE
                </span>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Unlimited Annual Subscription
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-blue-600">${SUBSCRIPTION_PRICE}</span>
                  <span className="text-slate-600 text-sm">/year</span>
                </div>
                <p className="text-blue-800 text-sm font-medium">
                  Save over 70% if you audit 4+ bills per year
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700 font-medium">
                    Unlimited bill audits for 1 year
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">All one-time purchase features</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">Instant report unlocking</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-700">Priority support</span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={subscribing || hasActiveSubscription}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition"
              >
                {hasActiveSubscription
                  ? 'Already Subscribed'
                  : subscribing
                    ? 'Loading...'
                    : isAuthenticated
                      ? 'Subscribe for $99.97/year'
                      : 'Sign Up & Subscribe'}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-slate-600 text-center mt-2">
                  Requires account • Cancel anytime
                </p>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> The subscription only works for bills where the patient name
              matches your registered account name. We use intelligent name matching (e.g., "Andy"
              matches "Andrew", "Beth" matches "Elizabeth").
            </p>
          </div>

          {/* Close Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
