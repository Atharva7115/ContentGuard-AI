export const generateMockMatches = () => [
  {
    id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=225&fit=crop',
    title: 'Championship Finals Highlights - Unauthorized Upload',
    similarity: 94,
    status: 'high',
    timestamp: '2 min ago',
    channel: 'SportsClips HD'
  },
  {
    id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=225&fit=crop',
    title: 'Game Recap - Similar Content Detected',
    similarity: 87,
    status: 'high',
    timestamp: '15 min ago',
    channel: 'FastSports'
  },
  {
    id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=225&fit=crop',
    title: 'Player Interview Compilation',
    similarity: 76,
    status: 'medium',
    timestamp: '1 hour ago',
    channel: 'SportsDaily'
  },
  {
    id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=225&fit=crop',
    title: 'Training Session Footage',
    similarity: 68,
    status: 'medium',
    timestamp: '3 hours ago',
    channel: 'TeamUpdates'
  },
  {
    id: 5,
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=225&fit=crop',
    title: 'Stadium Tour Video',
    similarity: 52,
    status: 'low',
    timestamp: '5 hours ago',
    channel: 'VenueViews'
  },
]

export const generateActivityFeed = () => [
  { id: 1, title: 'New match detected', similarity: 94, time: '2 min ago', status: 'high' },
  { id: 2, title: 'High similarity content trending', similarity: 87, time: '15 min ago', status: 'high' },
  { id: 3, title: 'Content flagged for review', similarity: 76, time: '1 hour ago', status: 'medium' },
  { id: 4, title: 'Monitoring scan completed', similarity: 68, time: '3 hours ago', status: 'medium' },
  { id: 5, title: 'New content uploaded', similarity: 52, time: '5 hours ago', status: 'low' },
]

export const generateChartData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, i) => ({
    day,
    matches: Math.floor(Math.random() * 20) + 5
  }))
}

export const monitoredContent = [
  {
    id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=225&fit=crop',
    title: 'Championship Finals 2024 - Full Game',
    uploadDate: '2024-04-15',
    status: 'active',
    matches: 12
  },
  {
    id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=225&fit=crop',
    title: 'Season Highlights Compilation',
    uploadDate: '2024-04-10',
    status: 'active',
    matches: 8
  },
  {
    id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=225&fit=crop',
    title: 'Exclusive Player Interviews',
    uploadDate: '2024-04-08',
    status: 'active',
    matches: 5
  },
]
