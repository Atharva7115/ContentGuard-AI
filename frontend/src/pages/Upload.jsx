import { useState } from 'react'
import Card from '../components/Card'

export default function Upload() {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [file, setFile] = useState(null)

  const processingSteps = [
    { name: 'Extracting frames', duration: 2000 },
    { name: 'Generating DNA', duration: 3000 },
    { name: 'Generating keywords', duration: 2000 },
    { name: 'Initializing monitoring', duration: 1500 },
  ]

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleUpload(selectedFile)
    }
  }

  const handleUpload = async (uploadedFile) => {
    setUploading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setUploading(false)
    setProcessing(true)
    
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration))
    }
    
    setCurrentStep(processingSteps.length)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setProcessing(false)
    setCurrentStep(0)
    setFile(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Upload Content</h1>
        <p className="mt-1 text-sm text-gray-600">Upload your original content to start monitoring</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          {!uploading && !processing && (
            <div>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">MP4, MOV, AVI up to 2GB</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="mt-4 text-sm text-gray-600 text-center">
                Upload original content to start monitoring for unauthorized use
              </p>
            </div>
          )}

          {uploading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-gray-900">Uploading...</p>
              <p className="mt-2 text-sm text-gray-600">{file?.name}</p>
            </div>
          )}

          {processing && (
            <div className="py-8">
              <div className="mb-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Processing Content</h3>
                <p className="mt-1 text-sm text-gray-600">This may take a few moments</p>
              </div>

              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep ? 'bg-green-600' :
                      index === currentStep ? 'bg-blue-600' :
                      'bg-gray-200'
                    }`}>
                      {index < currentStep ? (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : index === currentStep ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                ))}

                {currentStep === processingSteps.length && (
                  <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900">Processing complete</p>
                        <p className="text-sm text-green-700">Your content is now being monitored</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card className="mt-6 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">What happens after upload?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Content Analysis</p>
                <p className="text-sm text-gray-600">We extract key frames and generate a unique DNA signature</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Keyword Generation</p>
                <p className="text-sm text-gray-600">AI generates relevant keywords for monitoring</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Continuous Monitoring</p>
                <p className="text-sm text-gray-600">System scans YouTube every 10 minutes for similar content</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
