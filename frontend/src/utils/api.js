/**
 * API Client
 * Centralized API calls to the ContentGuard AI backend.
 * Uses VITE_API_URL env var in production, or empty string to use Vite's dev proxy.
 */

const API_BASE = import.meta.env.VITE_API_URL || ""

// Simple error logger
const logError = (context, error) => {
  console.error(`[API Error - ${context}]`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
}

/**
 * Upload Video
 */
export const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Upload failed')
    }

    return response.json()
  } catch (error) {
    logError('uploadVideo', error)
    throw error
  }
}

/**
 * Detect Similarity (Existing)
 */
export const detectSimilarity = async (videoUrl, fileName, contentId) => {
  try {
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
  } catch (error) {
    logError('detectSimilarity', error)
    throw error
  }
}

/**
 * 🔥 ML ANALYSIS (NEW - Connected to your deployment)
 */
export const analyzeWithML = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'ML Analysis failed')
    }

    return response.json()
  } catch (error) {
    logError('analyzeWithML', error)
    throw error
  }
}

/**
 * Fetch Stats
 */
export const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/stats`)
    if (!response.ok) throw new Error('Failed to fetch stats')
    return response.json()
  } catch (error) {
    logError('fetchStats', error)
    throw error
  }
}

/**
 * Fetch Activity
 */
export const fetchActivity = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/activity`)
    if (!response.ok) throw new Error('Failed to fetch activity')
    return response.json()
  } catch (error) {
    logError('fetchActivity', error)
    throw error
  }
}

/**
 * Fetch Content
 */
export const fetchContent = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/content`)
    if (!response.ok) throw new Error('Failed to fetch content')
    return response.json()
  } catch (error) {
    logError('fetchContent', error)
    throw error
  }
}

/**
 * Fetch Matches
 */
export const fetchMatches = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE}/api/detect/matches/${contentId}`)
    if (!response.ok) throw new Error('Failed to fetch matches')
    return response.json()
  } catch (error) {
    logError('fetchMatches', error)
    throw error
  }
}