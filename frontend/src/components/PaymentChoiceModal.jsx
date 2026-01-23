/**
 * Payment Choice Modal
 * Shows payment option when user wants to unlock their report
 * One-time purchase of $49.00 per bill
 */

import { useState } from 'react'
import { REPORT_PRICE } from '../config'
import PaymentModal from './PaymentModal'

export default function PaymentChoiceModal({ auditId, totalSavings, onClose, onSuccess }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  function handlePurchase() {
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-trust text-white p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold mb-2">Unlock Your Full Report</h2>
          <p className="text-primary-100">
            You could save ${totalSavings.toFixed(2)} on this bill!
          </p>
        </div>

        {/* Payment Option */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">One-Time Bill Scan</h3>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold text-primary-600">
                ${REPORT_PRICE.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">One-time payment for this bill</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5"
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
              <span className="text-gray-700">Full audit report with all errors</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5"
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
              <span className="text-gray-700">Charity care eligibility analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5"
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
              <span className="text-gray-700">Professional appeal letter</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5"
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
              <span className="text-gray-700">No account required</span>
            </li>
          </ul>

          <button
            onClick={handlePurchase}
            className="w-full bg-gradient-trust text-white font-semibold py-3 rounded-lg transition hover:opacity-90 shadow-md"
          >
            Pay ${REPORT_PRICE.toFixed(2)} to Unlock
          </button>

          {/* Close Button */}
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 font-medium">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
