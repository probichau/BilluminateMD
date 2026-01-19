import { useState } from 'react'
import { X, FileText, CheckCircle, Download, Copy } from 'lucide-react'

export default function AppealLetterModal({ auditId, auditData, onClose }) {
  const [step, setStep] = useState(1) // 1: Verify Info, 2: Generating, 3: Display Letter
  const [verifiedInfo, setVerifiedInfo] = useState({
    fullName: auditData?.patientInfo?.name || '',
    address: auditData?.patientInfo?.address || '',
    phone: '',
    email: '',
  })
  const [letter, setLetter] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleVerify = async () => {
    // Validate required fields
    if (!verifiedInfo.fullName || !verifiedInfo.address) {
      setError('Please provide your full name and address')
      return
    }

    setStep(2)
    setError('')

    try {
      const response = await fetch(`http://localhost:3001/api/audit/${auditId}/generate-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verifiedPatientInfo: verifiedInfo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate letter')
      }

      const data = await response.json()
      setLetter(data.letter)
      setStep(3)
    } catch (err) {
      console.error('Error generating letter:', err)
      setError(err.message || 'Failed to generate appeal letter. Please try again.')
      setStep(1)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appeal-letter-${auditId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-900">
              {step === 1 && 'Verify Your Information'}
              {step === 2 && 'Generating Your Appeal Letter'}
              {step === 3 && 'Your Appeal Letter'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Verify Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Important:</strong> Please verify your information below. This will be used in your appeal letter to the hospital.
                  Make sure everything is accurate and up-to-date.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={verifiedInfo.fullName}
                    onChange={(e) => setVerifiedInfo({ ...verifiedInfo, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mailing Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={verifiedInfo.address}
                    onChange={(e) => setVerifiedInfo({ ...verifiedInfo, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="123 Main Street&#10;Apt 4B&#10;City, State 12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={verifiedInfo.phone}
                    onChange={(e) => setVerifiedInfo({ ...verifiedInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={verifiedInfo.email}
                    onChange={(e) => setVerifiedInfo({ ...verifiedInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Generate Appeal Letter
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Generating */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-lg font-medium text-slate-900">Generating your appeal letter...</p>
              <p className="text-sm text-slate-600 mt-2">This may take a moment</p>
            </div>
          )}

          {/* Step 3: Display Letter */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-900 font-medium">
                    Your appeal letter has been generated!
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    Review the letter below, copy it, or download it as a text file.
                    Print it on professional letterhead if available, sign it, and mail it to the hospital's billing department.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download as Text File
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-900 leading-relaxed">
                  {letter}
                </pre>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
