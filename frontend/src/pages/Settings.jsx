import { useState } from 'react'
import Card from '../components/Card'
import Badge from '../components/Badge'

export default function Settings() {
  const [keywords] = useState([
    'championship finals',
    'game highlights',
    'player interview',
    'season recap',
    'exclusive footage',
    'behind the scenes',
    'training session',
    'match analysis'
  ])

  const [settings, setSettings] = useState({
    scanFrequency: '10',
    platform: 'youtube',
    notifications: true,
    autoReport: false
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Monitoring Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure how ContentGuard AI monitors your content</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Scan Configuration</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Scan Frequency
              </label>
              <select
                value={settings.scanFrequency}
                onChange={(e) => setSettings({ ...settings, scanFrequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">How often the system scans for new matches</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Platform
              </label>
              <select
                value={settings.platform}
                onChange={(e) => setSettings({ ...settings, platform: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="youtube">YouTube</option>
                <option value="all">All Platforms (Coming Soon)</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">Which platforms to monitor</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Auto-Generated Keywords</h2>
          <p className="text-sm text-gray-600 mb-4">
            These keywords are automatically generated from your content and used for monitoring
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="default">
                {keyword}
              </Badge>
            ))}
          </div>
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add custom keyword
          </button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts when high-risk matches are detected</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-Report</p>
                <p className="text-sm text-gray-600">Automatically submit takedown requests for high-risk matches</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoReport: !settings.autoReport })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoReport ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoReport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Detection Thresholds</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900">High Risk Threshold</label>
                <span className="text-sm text-gray-600">80%+</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                defaultValue="80"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-2 text-sm text-gray-600">Matches above this similarity are marked as high risk</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900">Medium Risk Threshold</label>
                <span className="text-sm text-gray-600">60%+</span>
              </div>
              <input
                type="range"
                min="50"
                max="80"
                defaultValue="60"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="mt-2 text-sm text-gray-600">Matches above this similarity are marked as medium risk</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
