import Badge from './Badge'

export default function ActivityItem({ title, similarity, time, status }) {
  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{similarity}% similarity</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
      </div>
      <Badge variant={status}>{status}</Badge>
    </div>
  )
}
