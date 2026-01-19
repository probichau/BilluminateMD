/**
 * Pricing Page
 * Shows two pricing options: per-bill and annual subscription
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL, REPORT_PRICE, SUBSCRIPTION_PRICE } from '../config'

export default function PricingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, hasActiveSubscription } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setError('')
    setLoading(true)

    try {
      if (!isAuthenticated) {
        // Redirect to register with return path
        navigate('/register', { state: { from: '/pricing' } })
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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Home
        </Link>
      </div>

      {/* Pricing Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-slate-600">
            Save money on medical bills with AI-powered auditing
          </p>
        </div>

        {/* Active Subscription Notice */}
        {hasActiveSubscription && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl text-center">
            ✅ You have an active unlimited subscription
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Per-Bill Option */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pay Per Bill</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-blue-600">${REPORT_PRICE}</span>
                <span className="text-slate-600">per bill</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
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
                <span className="text-slate-700">Full bill audit and error detection</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
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
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
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
                <span className="text-slate-700">Professional appeal letter generation</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
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

            <Link
              to="/"
              className="block w-full text-center bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition shadow-md hover:shadow-lg"
            >
              Upload a Bill
            </Link>
          </div>

          {/* Subscription Option */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-sm shadow-md">
                BEST VALUE
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Unlimited Annual</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-white">${SUBSCRIPTION_PRICE}</span>
                <span className="text-blue-100">per year</span>
              </div>
              <p className="text-blue-100 text-sm mt-2">Save over 70% vs. 4+ bills</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5"
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
                <span className="text-white font-medium">Unlimited bill audits for 1 year</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5"
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
                <span className="text-white">All per-bill features included</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5"
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
                <span className="text-white">Instant report unlocking</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5"
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
                <span className="text-white">Priority support</span>
              </li>
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading || hasActiveSubscription}
              className="w-full bg-white hover:bg-blue-50 disabled:bg-slate-300 text-blue-600 font-semibold py-3 rounded-lg transition shadow-md hover:shadow-lg"
            >
              {hasActiveSubscription
                ? 'Already Subscribed'
                : loading
                  ? 'Loading...'
                  : isAuthenticated
                    ? 'Subscribe Now'
                    : 'Sign Up & Subscribe'}
            </button>

            <p className="text-blue-100 text-xs text-center mt-4">
              {!isAuthenticated && 'Account required • '}Cancel anytime
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Who can use the unlimited subscription?
              </h3>
              <p className="text-slate-700">
                The unlimited subscription is for bills where the patient name matches your
                registered account name. We use intelligent name matching (e.g., "Andy" matches
                "Andrew", "Beth" matches "Elizabeth").
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I audit bills for family members?
              </h3>
              <p className="text-slate-700">
                The subscription only works for bills matching your registered name. For family
                members' bills, use the pay-per-bill option at ${REPORT_PRICE} each.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-slate-700">
                Yes, you can cancel anytime. Your benefits continue until the end of your current
                billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
