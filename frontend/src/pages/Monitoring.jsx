import { useState } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { monitoredContent, generateMockMatches } from '../utils/mockData'

export default function Monitoring() {
  const [selectedContent, setSelectedContent] = useState(monitoredContent[0])
  const [matches] = useState(generateMockMatches())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Content Monitoring</h1>
        <p className="mt-1 text-sm text-gray-600">Track and manage your protected content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Your Content</h2>
          <div className="space-y-3">
            {monitoredContent.map((content) => (
              <button
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedContent.id === content.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-20 object-cover rounded mb-2"
                />
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{content.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="active">Active</Badge>
                  <span className="text-xs text-gray-600">{content.matches} matches</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            <img
              src={selectedContent.thumbnail}
              alt={selectedContent.title}
              className="w-48 h-27 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedContent.title}</h2>
                  <p className="mt-1 text-sm text-gray-600">Uploaded {selectedContent.uploadDate}</p>
                </div>
                <Badge variant="active">Monitoring Active</Badge>
              </div>
              <div className="mt-4 flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-600">Total Matches</p>
                  <p className="text-2xl font-semibold text-gray-900">{selectedContent.matches}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">High Risk</p>
                  <p className="text-2xl font-semibold text-red-600">3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Scan</p>
                  <p className="text-sm font-medium text-gray-900">2 min ago</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Matches</h3>
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <img
                    src={match.thumbnail}
                    alt={match.title}
                    className="w-40 h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{match.title}</h4>
                        <p className="mt-1 text-sm text-gray-600">{match.channel}</p>
                      </div>
                      <Badge variant={match.status}>
                        {match.status === 'high' ? 'High Risk' : match.status === 'medium' ? 'Medium Risk' : 'Low Risk'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Similarity:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                match.similarity >= 80 ? 'bg-red-600' :
                                match.similarity >= 60 ? 'bg-yellow-600' :
                                'bg-green-600'
                              }`}
                              style={{ width: `${match.similarity}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{match.similarity}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{match.timestamp}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
