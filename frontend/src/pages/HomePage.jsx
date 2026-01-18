import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUp, Camera, FileText } from 'lucide-react'
import UploadZone from '../components/UploadZone'
import ProcessingModal from '../components/ProcessingModal'

function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const navigate = useNavigate()

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

      // Send to backend API
      const response = await fetch('/api/audit/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      // Navigate to results page
      navigate(`/results/${data.auditId}`)
    } catch (error) {
      console.error('Error processing bill:', error)
      alert('An error occurred while processing your bill. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
