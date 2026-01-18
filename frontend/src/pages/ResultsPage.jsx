import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, Lock, CheckCircle, DollarSign, ArrowLeft } from 'lucide-react'
import PaymentModal from '../components/PaymentModal'

function ResultsPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const [auditData, setAuditData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  useEffect(() => {
    fetchAuditResults()
  }, [auditId])

  const fetchAuditResults = async () => {
    try {
      const response = await fetch(`/api/audit/${auditId}`)
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

  const totalPotentialSavings = auditData.errors.reduce(
    (sum, error) => sum + error.potentialSavings,
    0
  )

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
          Analysis completed for {auditData.patientInfo.name}
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium opacity-90 mb-2">
              Potential Savings Identified
            </h2>
            <p className="text-5xl font-bold">
              ${totalPotentialSavings.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">
              <p className="text-sm opacity-90">Errors Found</p>
              <p className="text-3xl font-bold">{auditData.errors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info - Always Visible */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Patient Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoRow label="Name" value={auditData.patientInfo.name} />
          <InfoRow label="Date of Birth" value={auditData.patientInfo.dob} />
          <InfoRow label="Date of Service" value={auditData.serviceInfo.dateOfService} />
          <InfoRow label="Provider" value={auditData.providerInfo.name} />
          <InfoRow label="Total Billed" value={`$${auditData.financials.totalBilled.toFixed(2)}`} />
          <InfoRow label="Patient Responsibility" value={`$${auditData.financials.patientResponsibility.toFixed(2)}`} />
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
          {auditData.errors.map((error, index) => (
            <ErrorCard key={index} error={error} />
          ))}
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
                Unlock for $9.99
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps - Visible after payment */}
      {isPaid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Next Steps
              </h3>
              <ul className="space-y-2 text-green-800">
                <li>1. Contact your provider's billing department with these specific findings</li>
                <li>2. Reference the CPT codes and dates of service listed above</li>
                <li>3. Request a detailed invoice review</li>
                <li>4. Ask for corrections or adjustments based on the errors found</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          auditId={auditId}
          amount={9.99}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
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
            <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[error.severity]}`}>
              {error.type}
            </span>
            <span className="text-sm text-slate-500">
              {error.cptCode}
            </span>
          </div>
          <h4 className="font-semibold text-slate-900 mb-1">
            {error.description}
          </h4>
          <p className="text-sm text-slate-600">
            {error.explanation}
          </p>
        </div>
        <div className="ml-4 text-right">
          <p className="text-sm text-slate-500">Potential Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${error.potentialSavings.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-sm text-slate-700">
          <strong>What to do:</strong> {error.actionableAdvice}
        </p>
      </div>
    </div>
  )
}

export default ResultsPage
