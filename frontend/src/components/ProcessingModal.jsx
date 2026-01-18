import { Loader2 } from 'lucide-react'

function ProcessingModal({ stage }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Analyzing Your Bill
          </h2>

          <p className="text-lg text-primary-600 font-medium mb-6">
            {stage}
          </p>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            This typically takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProcessingModal
