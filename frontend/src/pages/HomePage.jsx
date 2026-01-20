import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileUp, Camera, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import UploadZone from '../components/UploadZone'
import ProcessingModal from '../components/ProcessingModal'
import { API_URL } from '../config'

function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, user, hasActiveSubscription, logout, getAuthHeaders } = useAuth()

  const handleFileUpload = async (file) => {
    setIsProcessing(true)

    const stages = [
      'Uploading your bill...',
      'Reading patient information...',
      'Extracting service codes...',
      'Checking CPT codes...',
      'Analyzing line items...',
      'Detecting billing errors...',
      'Calculating potential savings...',
      'Generating your report...'
    ]

    try {
      // Simulate processing stages
      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i])
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('bill', file)

      // Send to backend API with optional auth headers
      const response = await fetch(`${API_URL}/api/audit/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorData = { error: 'Unknown server error', details: 'Could not parse error response' }
        }

        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })

        const errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Navigate to financial info page to collect household data
      navigate('/financial-info', {
        state: {
          auditId: data.auditId,
          providerName: data.providerName,
          patientResponsibility: data.patientResponsibility,
        }
      })
    } catch (error) {
      console.error('Error processing bill:', error)

      // Detect specific error types and provide friendly messages
      let userMessage = error.message

      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Cannot connect to server. Please check your internet connection and try again.'
      } else if (error.message.includes('NOT_A_MEDICAL_BILL')) {
        userMessage = "It looks like the file you provided isn't a medical bill that we can read. Please double-check which file you're uploading and try again.\n\nWe support:\n• Medical bills with itemized charges\n• Explanation of Benefits (EOB) from insurance\n• Hospital or clinic billing statements"
      } else if (error.message.includes('INCOMPLETE_BILL_DATA')) {
        userMessage = "We could only partially read your medical bill. It may be missing key information like provider details or itemized charges. Please upload a complete billing statement."
      } else if (error.message.includes('AI analysis failed') || error.message.includes('AI response missing')) {
        userMessage = "We had trouble reading your bill. This could happen if:\n• The image quality is too low\n• The document isn't a standard medical bill format\n• Important information is cut off\n\nPlease try uploading a clearer photo or a different page of the bill."
      }

      alert(userMessage)
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Top Navigation */}
      <div className="flex justify-end items-center mb-8">
        <div className="flex gap-3">
          {isAuthenticated ? (
            <>
              <div className="text-sm text-slate-600">
                {user?.email}
                {hasActiveSubscription && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Unlimited
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          BilluminateMD
        </h1>
        <p className="text-xl text-slate-600 mb-2">
          Find Hidden Errors in Your Medical Bills
        </p>
        <p className="text-lg text-slate-500">
          Upload your bill and let AI find potential overcharges
        </p>
      </header>

      {/* Main Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <UploadZone onFileSelect={handleFileUpload} disabled={isProcessing} />
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <FeatureCard
          icon={<FileUp className="w-8 h-8 text-primary-600" />}
          title="Easy Upload"
          description="Take a photo or upload a PDF of your medical bill"
        />
        <FeatureCard
          icon={<Camera className="w-8 h-8 text-primary-600" />}
          title="AI Analysis"
          description="Our AI scans for duplicate charges, upcoding, and errors"
        />
        <FeatureCard
          icon={<FileText className="w-8 h-8 text-primary-600" />}
          title="Get Results"
          description="Receive a detailed report of potential savings"
        />
      </div>

      {/* Processing Modal */}
      {isProcessing && (
        <ProcessingModal stage={processingStage} />
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

export default HomePage
