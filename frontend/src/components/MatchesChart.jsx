import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from './Card'

const chartData = [
  { day: 'Mon', matches: 5 },
  { day: 'Tue', matches: 8 },
  { day: 'Wed', matches: 12 },
  { day: 'Thu', matches: 9 },
  { day: 'Fri', matches: 15 },
  { day: 'Sat', matches: 18 },
  { day: 'Sun', matches: 27 },
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-xs text-gray-600">{payload[0].payload.day}</p>
        <p className="text-sm font-semibold text-gray-900">{payload[0].value} matches</p>
      </div>
    )
  }
  return null
}

export default function MatchesChart() {
  const currentWeekTotal = chartData.reduce((sum, day) => sum + day.matches, 0)
  const previousWeekTotal = 79
  const percentageChange = Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Matches Over Time</h2>
          <p className="text-sm text-gray-600 mt-1">Detected matches in the last 7 days</p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-md">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="text-sm font-medium text-green-700">+{percentageChange}%</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
            <Line 
              type="monotone" 
              dataKey="matches" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
          <span className="text-sm text-gray-600">Detected Matches</span>
        </div>
        <span className="text-sm text-gray-500">Last 7 days</span>
      </div>
    </Card>
  )
}
