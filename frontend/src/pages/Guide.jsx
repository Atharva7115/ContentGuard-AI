import Card from '../components/Card'

export default function Guide() {
  const steps = [
    {
      number: 1,
      title: 'Upload Content',
      description: 'Upload your original video or image content to the platform. Supported formats include MP4, MOV, AVI, and common image formats.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'AI Generates DNA + Metadata',
      description: 'Our AI system extracts key frames, generates a unique content DNA signature, and creates relevant keywords for monitoring.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'System Monitors YouTube Automatically',
      description: 'ContentGuard AI continuously scans YouTube every 10 minutes using advanced algorithms to detect similar or unauthorized content.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      number: 4,
      title: 'Detects Similar Content',
      description: 'When potential matches are found, the system calculates similarity scores and categorizes them by risk level (High, Medium, Low).',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      number: 5,
      title: 'Shows Alerts & Results',
      description: 'View real-time alerts, detailed match reports, and take action on unauthorized content directly from your dashboard.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
  ]

  const features = [
    {
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms analyze visual and audio patterns to identify unauthorized content with high accuracy.'
    },
    {
      title: 'Real-Time Monitoring',
      description: 'Continuous scanning ensures you\'re notified immediately when similar content appears on YouTube.'
    },
    {
      title: 'Similarity Scoring',
      description: 'Each match receives a detailed similarity score, helping you prioritize which content requires immediate action.'
    },
    {
      title: 'Automated Workflows',
      description: 'Set up automated responses for different risk levels, from simple notifications to takedown requests.'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900">How ContentGuard AI Works</h1>
        <p className="mt-4 text-lg text-gray-600">
          Protect your content with AI-powered monitoring that works 24/7 to detect unauthorized use
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white z-10">
                  {step.icon}
                </div>
                <Card className="flex-1 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-8">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="max-w-4xl mx-auto p-8 bg-blue-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">Ready to protect your content?</h3>
          <p className="mt-2 text-sm text-gray-600">Upload your first video and start monitoring in minutes</p>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </Card>
    </div>
  )
}
