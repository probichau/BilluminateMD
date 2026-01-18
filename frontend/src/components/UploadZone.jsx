import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FileText } from 'lucide-react'

function UploadZone({ onFileSelect, disabled }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }

      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled,
  })

  const handleCameraCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        onFileSelect(file)
      }
    }
    input.click()
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="mb-4">
            <img
              src={preview}
              alt="Bill preview"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
            />
          </div>
        ) : (
          <div className="mb-6">
            <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          </div>
        )}

        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Audit My Bill
        </h3>
        <p className="text-slate-600 mb-6">
          {isDragActive
            ? 'Drop your bill here'
            : 'Drag and drop your medical bill, or click to select'
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <FileText className="w-5 h-5 mr-2" />
            Choose File
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors sm:hidden"
            onClick={(e) => {
              e.stopPropagation()
              handleCameraCapture()
            }}
          >
            <Camera className="w-5 h-5 mr-2" />
            Take Photo
          </button>
        </div>

        <p className="text-sm text-slate-500 mt-4">
          Supports JPG, PNG, HEIC, and PDF files
        </p>
      </div>
    </div>
  )
}

export default UploadZone
