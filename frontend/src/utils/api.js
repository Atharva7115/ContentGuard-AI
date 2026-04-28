/**
 * API Client
 * Centralized API calls to the ContentGuard AI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL

export const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Upload failed')
  }

  return response.json()
}

export const detectSimilarity = async (videoUrl, fileName, contentId) => {
  const response = await fetch(`${API_BASE}/api/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl, fileName, contentId }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Detection failed')
  }

  return response.json()
}

export const fetchStats = async () => {
  const response = await fetch(`${API_BASE}/api/stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

export const fetchActivity = async () => {
  const response = await fetch(`${API_BASE}/api/activity`)
  if (!response.ok) throw new Error('Failed to fetch activity')
  return response.json()
}

export const fetchContent = async () => {
  const response = await fetch(`${API_BASE}/api/content`)
  if (!response.ok) throw new Error('Failed to fetch content')
  return response.json()
}

export const fetchMatches = async (contentId) => {
  const response = await fetch(`${API_BASE}/api/detect/matches/${contentId}`)
  if (!response.ok) throw new Error('Failed to fetch matches')
  return response.json()
}