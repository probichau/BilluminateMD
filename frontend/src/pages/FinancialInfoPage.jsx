import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_URL } from '../config'

function FinancialInfoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auditId, providerName, patientResponsibility } = location.state || {}

  const [householdIncome, setHouseholdIncome] = useState('')
  const [householdSize, setHouseholdSize] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/audit/${auditId}/financial-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          householdIncome: parseFloat(householdIncome),
          householdSize: parseInt(householdSize),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to submit financial information')
      }

      const data = await response.json()

      // Navigate to results page
      navigate(`/results/${auditId}`)
    } catch (err) {
      console.error('Error submitting financial info:', err)
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  if (!auditId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">No audit information found. Please upload a bill first.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Upload Bill
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Financial Information
        </h1>
        <p className="text-lg text-slate-600">
          Help us calculate your eligibility for charity care and financial assistance
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-2">Why we need this information:</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Many non-profit hospitals are <strong>required by law</strong> to provide charity care based on income</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>We calculate your eligibility using <strong>Federal Poverty Level (FPL)</strong> guidelines</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Your information is <strong>private</strong> and used only for this analysis</span>
          </li>
        </ul>
      </div>

      {/* Bill Info */}
      {providerName && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Provider:</p>
              <p className="font-semibold text-slate-900">{providerName}</p>
            </div>
            {patientResponsibility && (
              <div className="text-right">
                <p className="text-sm text-slate-600">Amount You Owe:</p>
                <p className="font-semibold text-slate-900 text-xl">
                  ${patientResponsibility.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Household Income */}
        <div>
          <label htmlFor="householdIncome" className="block text-sm font-medium text-slate-700 mb-2">
            Annual Household Income
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
            <input
              type="number"
              id="householdIncome"
              value={householdIncome}
              onChange={(e) => setHouseholdIncome(e.target.value)}
              required
              min="0"
              step="1"
              placeholder="50000"
              className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          <p className="text-sm text-slate-500 mt-1">Enter your total household income before taxes</p>
        </div>

        {/* Household Size */}
        <div>
          <label htmlFor="householdSize" className="block text-sm font-medium text-slate-700 mb-2">
            Household Size
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            id="householdSize"
            value={householdSize}
            onChange={(e) => setHouseholdSize(e.target.value)}
            required
            min="1"
            max="20"
            step="1"
            placeholder="4"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <p className="text-sm text-slate-500 mt-1">
            Number of people living in your household (including yourself)
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            🔒 <strong>Privacy:</strong> Your financial information is used only to calculate charity care eligibility and is not shared with third parties.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Calculating...' : 'Calculate Savings'}
          </button>
        </div>
      </form>

      {/* Educational Content */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Understanding Charity Care</h3>
        <div className="space-y-4 text-slate-600">
          <p>
            <strong>Federal Poverty Level (FPL):</strong> The government sets income thresholds each year based on household size. Non-profit hospitals typically offer:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>100% discount</strong> for households at or below 100% FPL</li>
            <li><strong>Sliding scale discounts</strong> for households up to 200-400% FPL</li>
            <li>Some hospitals offer assistance even above these levels</li>
          </ul>
          <p>
            <strong>Your Rights:</strong> IRS requires 501(c)(3) non-profit hospitals to have charity care policies. You have the right to apply for financial assistance, often retroactively.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FinancialInfoPage
