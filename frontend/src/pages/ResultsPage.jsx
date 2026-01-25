import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Lock, CheckCircle, DollarSign, ArrowLeft, FileText } from 'lucide-react'
import PaymentChoiceModal from '../components/PaymentChoiceModal'
import AppealLetterModal from '../components/AppealLetterModal'
import { API_URL } from '../config'

function ResultsPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const [auditData, setAuditData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAppealLetterModal, setShowAppealLetterModal] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    fetchAuditResults()
  }, [auditId])

  const fetchAuditResults = async () => {
    try {
      const response = await fetch(`${API_URL}/api/audit/${auditId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch audit results')
      }
      const data = await response.json()
      setAuditData(data)
      setIsPaid(data.isPaid)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching audit results:', error)
      alert('Could not load audit results')
      navigate('/')
    }
  }

  const handlePaymentSuccess = async () => {
    setIsPaid(true)
    setShowPaymentModal(false)
    await fetchAuditResults()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Use the savings breakdown from backend if available, otherwise calculate from errors
  const totalPotentialSavings = auditData?.savings?.total ?? (
    auditData?.errors?.reduce((sum, error) => sum + (error.potentialSavings || 0), 0) ?? 0
  )

  const billingErrorSavings = auditData?.savings?.billingErrors ?? totalPotentialSavings
  const charitySavings = auditData?.savings?.charityCare ?? 0

  // Check if charity care status is uncertain/unknown
  const charityConfidence = auditData?.charityAnalysis?.eligibilityCheck?.confidence
  const isCharityStatusUncertain = charityConfidence === 'unknown' || charityConfidence === 'uncertain'

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Audit Results</h1>
        <p className="text-slate-600 mt-2">
          Analysis completed for {auditData?.patientInfo?.name ?? 'Patient'}
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90 mb-2">
              Total Potential Savings
            </h2>
            <p className="text-5xl font-bold">
              ${totalPotentialSavings.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">
              <p className="text-sm opacity-90">Issues Found</p>
              <p className="text-3xl font-bold">{auditData?.errors?.length ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Savings Breakdown */}
        {auditData.savings && (
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-75">Billing Errors</p>
                <p className="text-2xl font-semibold">${billingErrorSavings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Charity Care Eligible</p>
                <p className="text-2xl font-semibold">
                  {isCharityStatusUncertain && charitySavings === 0
                    ? 'Need more data'
                    : `$${charitySavings.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Info - Always Visible */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Patient Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoRow label="Name" value={auditData?.patientInfo?.name ?? 'N/A'} />
          <InfoRow label="Date of Birth" value={auditData?.patientInfo?.dob ?? 'N/A'} />
          <InfoRow label="Date of Service" value={auditData?.serviceInfo?.dateOfService ?? 'N/A'} />
          <InfoRow label="Provider" value={auditData?.providerInfo?.name ?? 'N/A'} />
          <InfoRow label="Total Billed" value={`$${(auditData?.financials?.totalBilled ?? 0).toFixed(2)}`} />
          <InfoRow label="Patient Responsibility" value={`$${(auditData?.financials?.patientResponsibility ?? 0).toFixed(2)}`} />
        </div>
      </div>

      {/* Errors Section - Blurred if not paid */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Detailed Findings
          </h3>
          {!isPaid && (
            <Lock className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <div className={isPaid ? '' : 'blur-content'}>
          {auditData?.errors?.length > 0 ? (
            auditData.errors.map((error, index) => (
              <ErrorCard key={index} error={error} />
            ))
          ) : (
            <p className="text-slate-600 text-center py-4">No billing errors detected</p>
          )}
        </div>

        {/* Overlay for unpaid users */}
        {!isPaid && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm rounded-xl">
            <div className="text-center max-w-md p-8">
              <Lock className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Unlock Full Report
              </h3>
              <p className="text-slate-600 mb-6">
                Get detailed explanations of each error and actionable steps to dispute them
              </p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Unlock Report
              </button>
              <p className="text-slate-500 text-sm mt-3">
                Starting at $49.00
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charity Care Eligibility Section - Only visible after payment */}
      {isPaid && auditData?.charityAnalysis && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Charity Care Eligibility
          </h3>

          <div className="space-y-4">
            {/* FPL Status */}
            {auditData.charityAnalysis.fplData && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Federal Poverty Level (FPL)</p>
                <p className="text-2xl font-bold text-slate-900">
                  {auditData.charityAnalysis.fplData.fplPercentage ?? 'N/A'}% of FPL
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Household Income: ${auditData.patientInfo?.householdIncome?.toLocaleString() ?? 'N/A'} |
                  Size: {auditData.patientInfo?.householdSize ?? 'N/A'} {auditData.patientInfo?.householdSize === 1 ? 'person' : 'people'}
                </p>
              </div>
            )}

            {/* Non-Profit Status */}
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Hospital Status</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {auditData.charityAnalysis?.eligibilityCheck?.confidence === 'unknown' || auditData.charityAnalysis?.eligibilityCheck?.confidence === 'uncertain'
                    ? '❓ Status Unknown'
                    : auditData.charityAnalysis?.eligibilityCheck?.isNonProfit
                      ? '✅ Non-Profit'
                      : '❌ For-Profit'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  auditData.charityAnalysis?.eligibilityCheck?.confidence === 'confirmed' ? 'bg-green-100 text-green-800' :
                  auditData.charityAnalysis?.eligibilityCheck?.confidence === 'high' ? 'bg-blue-100 text-blue-800' :
                  auditData.charityAnalysis?.eligibilityCheck?.confidence === 'likely' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {auditData.charityAnalysis?.eligibilityCheck?.confidence?.toUpperCase() ?? 'UNKNOWN'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {auditData.charityAnalysis?.eligibilityCheck?.reason ?? 'No additional information available'}
                {auditData.charityAnalysis?.eligibilityCheck?.npiData?.npi && (
                  <span className="block mt-1 text-xs text-slate-500">
                    NPI: {auditData.charityAnalysis.eligibilityCheck.npiData.npi}
                    {auditData.charityAnalysis.eligibilityCheck.npiData.ein && ` | EIN: ${auditData.charityAnalysis.eligibilityCheck.npiData.ein}`}
                  </span>
                )}
                {auditData.charityAnalysis?.eligibilityCheck?.irsData?.ein && !auditData.charityAnalysis?.eligibilityCheck?.npiData?.ein && (
                  <span className="block mt-1 text-xs text-slate-500">
                    EIN: {auditData.charityAnalysis.eligibilityCheck.irsData.ein}
                  </span>
                )}
              </p>
            </div>

            {/* Recommendation */}
            {auditData.charityAnalysis.recommendation && (
              <div className={`rounded-lg p-4 ${
                auditData.charityAnalysis.recommendation.shouldApply
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                <p className="font-semibold text-slate-900 mb-2">
                  {auditData.charityAnalysis.recommendation.message}
                </p>
                {auditData.charityAnalysis.recommendation.nextSteps?.length > 0 && (
                  <>
                    <p className="text-sm font-medium text-slate-700 mb-2">Next Steps:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {auditData.charityAnalysis.recommendation.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps - Visible after payment */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Next Steps
              </h3>
              <ul className="space-y-2 text-green-800 mb-4">
                <li>1. Generate a professional appeal letter using the button below</li>
                <li>2. Review and print the letter on professional letterhead if available</li>
                <li>3. Sign the letter and mail it to the hospital's billing department</li>
                <li>4. Keep a copy for your records</li>
              </ul>
              <button
                onClick={() => setShowAppealLetterModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
              >
                <FileText className="w-5 h-5" />
                Help Me Write My Appeal Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Choice Modal */}
      {showPaymentModal && (
        <PaymentChoiceModal
          auditId={auditId}
          totalSavings={totalPotentialSavings}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Appeal Letter Modal */}
      {showAppealLetterModal && (
        <AppealLetterModal
          auditId={auditId}
          auditData={auditData}
          onClose={() => setShowAppealLetterModal(false)}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-slate-900 font-medium">{value}</p>
    </div>
  )
}

function ErrorCard({ error }) {
  const severityColors = {
    high: 'bg-red-100 border-red-300 text-red-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-blue-100 border-blue-300 text-blue-800',
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[error?.severity] ?? 'bg-slate-100 border-slate-300 text-slate-800'}`}>
              {error?.type ?? 'Unknown'}
            </span>
            <span className="text-sm text-slate-500">
              {error?.cptCode ?? 'N/A'}
            </span>
          </div>
          <h4 className="font-semibold text-slate-900 mb-1">
            {error?.description ?? 'No description available'}
          </h4>
          <p className="text-sm text-slate-600">
            {error?.explanation ?? ''}
          </p>
        </div>
        <div className="ml-4 text-right">
          <p className="text-sm text-slate-500">Potential Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${(error?.potentialSavings ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
      {error?.actionableAdvice && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-700">
            <strong>What to do:</strong> {error.actionableAdvice}
          </p>
        </div>
      )}
    </div>
  )
}

export default ResultsPage
