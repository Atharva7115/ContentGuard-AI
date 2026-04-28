import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import ActivityItem from '../components/ActivityItem'
import MatchesChart from '../components/MatchesChart'
import { generateActivityFeed } from '../utils/mockData'
import { fetchStats, fetchActivity } from '../utils/api'

export default function Dashboard() {
  const [activities, setActivities] = useState(generateActivityFeed())
  const [stats, setStats] = useState({
    matchesToday: 24,
    highRisk: 8,
    monitoring: 'Active'
  })

  // Fetch real data from backend, fallback to mock data
  const loadData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        fetchStats(),
        fetchActivity()
      ])

      if (statsData) {
        setStats({
          matchesToday: statsData.matchesToday || 0,
          highRisk: statsData.highRisk || 0,
          monitoring: statsData.monitoring || 'Idle'
        })
      }

      if (activityData && activityData.length > 0) {
        setActivities(activityData)
      }
    } catch {
      // Backend not available, keep using current/mock data
    }
  }

  useEffect(() => {
    // Initial fetch
    loadData()

    // Poll every 15 seconds for updates
    const interval = setInterval(() => {
      loadData()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Monitor your content protection in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Matches Detected Today"
          value={stats.matchesToday}
          change="+12% from yesterday"
        />
        <StatCard
          title="High Risk Content"
          value={stats.highRisk}
          change="Requires attention"
        />
        <StatCard
          title="Monitoring Status"
          value={stats.monitoring}
          change="All systems operational"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MatchesChart />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <div className="space-y-1 -mx-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} {...activity} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Detections</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Content</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Similarity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activities.slice(0, 3).map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{activity.similarity}%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      activity.status === 'high' ? 'bg-red-50 text-red-700' :
                      activity.status === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{activity.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
