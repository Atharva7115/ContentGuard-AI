/**
 * API Client
 * Centralized API calls to the ContentGuard AI backend.
 * Falls back to mock data if the backend is unreachable.
 */

const API_BASE = '/api'

/**
 * Upload a video file to the backend.
 * @param {File} file - Video file from input
 * @returns {{ success, url, contentId, fileName }}
 */
export const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Upload failed')
  }

  return response.json()
}

/**
 * Run the full detection pipeline on an uploaded video.
 * @param {string} videoUrl - Cloudinary URL of the uploaded video
 * @param {string} fileName - Original filename for keyword context
 * @param {number} contentId - Content ID from upload
 * @returns {{ success, results: Array, keywords: string[] }}
 */
export const detectSimilarity = async (videoUrl, fileName, contentId) => {
  const response = await fetch(`${API_BASE}/detect`, {
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

/**
 * Fetch dashboard statistics.
 * @returns {{ matchesToday, highRisk, monitoring }}
 */
export const fetchStats = async () => {
  const response = await fetch(`${API_BASE}/stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

/**
 * Fetch activity feed.
 * @returns {Array<{ id, title, similarity, time, status }>}
 */
export const fetchActivity = async () => {
  const response = await fetch(`${API_BASE}/activity`)
  if (!response.ok) throw new Error('Failed to fetch activity')
  return response.json()
}

/**
 * Fetch monitored content list.
 * @returns {Array<{ id, title, thumbnail, uploadDate, status, matches }>}
 */
export const fetchContent = async () => {
  const response = await fetch(`${API_BASE}/content`)
  if (!response.ok) throw new Error('Failed to fetch content')
  return response.json()
}

/**
 * Fetch matches for a specific content piece.
 * @param {number} contentId
 * @returns {{ matches: Array }}
 */
export const fetchMatches = async (contentId) => {
  const response = await fetch(`${API_BASE}/detect/matches/${contentId}`)
  if (!response.ok) throw new Error('Failed to fetch matches')
  return response.json()
}
