/**
 * Subscription Success Page
 * Shown after successful Stripe checkout for annual subscription
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, Loader } from 'lucide-react'

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkSubscriptionStatus } = useAuth()
  const [loading, setLoading] = useState(true)
  const hasRun = useRef(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun.current) return
    hasRun.current = true

    async function handleSuccess() {
      const token = localStorage.getItem('authToken')
      const sessionId = searchParams.get('session_id')

      console.log('🎉 Processing subscription success', { hasToken: !!token, sessionId })

      // Verify the Stripe session and create subscription record
      if (sessionId) {
        try {
          const verifyResponse = await fetch('/api/subscription/verify-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          })

          if (verifyResponse.ok) {
            console.log('✅ Subscription verified and created')
          } else {
            const error = await verifyResponse.json()
            console.error('❌ Failed to verify session:', error)
          }
        } catch (error) {
          console.error('❌ Error verifying session:', error)
        }
      }

      // Give a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Refresh subscription status
      await checkSubscriptionStatus()

      // Unlock any existing audits for this user
      try {
        const response = await fetch('/api/subscription/unlock-existing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Unlocked ${data.unlockedCount} existing audit(s)`)
        } else {
          const error = await response.json()
          console.error('❌ Failed to unlock:', error)
        }
      } catch (error) {
        console.error('Failed to unlock existing audits:', error)
        // Continue anyway - this is not critical
      }

      // Check if user had a pending audit before subscribing
      const pendingAuditId = localStorage.getItem('pendingAuditId')
      console.log('🔍 Checking for pending audit ID:', pendingAuditId)
      console.log('📦 All localStorage keys:', Object.keys(localStorage))

      if (pendingAuditId) {
        console.log('✅ Found pending audit, redirecting to:', `/results/${pendingAuditId}`)
        // Clear the pending audit and redirect back to it
        localStorage.removeItem('pendingAuditId')
        navigate(`/results/${pendingAuditId}`, { replace: true })
        return
      }

      console.log('❌ No pending audit found, showing success page')
      setLoading(false)
    }

    handleSuccess()
  }, [checkSubscriptionStatus, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Setting up your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Welcome to Unlimited!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your annual subscription is now active. You can analyze unlimited medical bills for the
            next year with instant report unlocking.
          </p>

          {/* Benefits List */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-4">Your Benefits:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Unlimited bill audits</strong> for 1 year
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Instant report unlocking</strong> (no payment needed for matching bills)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Professional appeal letters</strong> for every bill
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Priority support</strong> via email
                </span>
              </li>
            </ul>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> Your subscription only works for bills where the patient name
              matches your registered account name. We use intelligent name matching (e.g., "Andy"
              matches "Andrew", "Beth" matches "Elizabeth").
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Upload Your First Bill
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-8 py-3 rounded-lg transition"
            >
              View Subscription Details
            </button>
          </div>

          {/* Receipt Info */}
          <p className="text-sm text-slate-500 mt-6">
            A receipt has been sent to your email. You can manage your subscription anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
