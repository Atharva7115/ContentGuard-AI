/**
 * Python ML Service Client
 * HTTP client to communicate with the Python Flask ML service.
 */

import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

// Timeout in ms: default 3 minutes, configurable via env
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || '180000', 10)

// Axios instance with reasonable timeouts
const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_TIMEOUT,
})

/**
 * Check if ML service is running.
 * @returns {boolean}
 */
export const isMLServiceHealthy = async () => {
  try {
    const resp = await mlClient.get('/health', { timeout: 5000 })
    return resp.data.status === 'ok'
  } catch {
    return false
  }
}

/**
 * Extract features (frames, hashes, embeddings) from a video URL.
 * Includes retry logic for transient failures.
 * 
 * @param {string} videoUrl - URL of the video
 * @param {boolean} isYouTube - Whether this is a YouTube video
 * @param {number} retries - Number of retry attempts (default 2)
 * @returns {{ frame_count: number, hashes: string[], embeddings: number[][] }}
 */
export const extractFeatures = async (videoUrl, isYouTube = false, retries = 2) => {
  let lastError
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${retries} for: ${videoUrl}`)
        // Exponential backoff: 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt - 1)))
      }

      console.log(`🔬 Extracting features: ${videoUrl} (YouTube: ${isYouTube})`)

      const response = await mlClient.post('/extract', {
        videoUrl,
        isYouTube
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Feature extraction failed')
      }

      return {
        frame_count: response.data.frame_count,
        hashes: response.data.hashes,
        embeddings: response.data.embeddings
      }
    } catch (error) {
      lastError = error
      const msg = error.response?.data?.error || error.message
      
      // Don't retry on certain errors
      if (msg.includes('not found') || msg.includes('invalid') || error.response?.status === 400) {
        console.error(`❌ ML Service extract error (non-retryable): ${msg}`)
        throw new Error(`Feature extraction failed: ${msg}`)
      }
      
      if (attempt === retries) {
        console.error(`❌ ML Service extract error (all retries exhausted): ${msg}`)
      }
    }
  }
  
  const msg = lastError?.response?.data?.error || lastError?.message || 'Unknown error'
  throw new Error(`Feature extraction failed after ${retries + 1} attempts: ${msg}`)
}

/**
 * Compare two feature sets and return similarity.
 * 
 * @param {object} sourceFeatures - { hashes, embeddings }
 * @param {object} targetFeatures - { hashes, embeddings }
 * @returns {{ similarity: number, confidence: string, matched_frames: number }}
 */
export const compareFeatures = async (sourceFeatures, targetFeatures) => {
  try {
    const response = await mlClient.post('/compare', {
      source: {
        hashes: sourceFeatures.hashes,
        embeddings: sourceFeatures.embeddings
      },
      target: {
        hashes: targetFeatures.hashes,
        embeddings: targetFeatures.embeddings
      }
    })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Comparison failed')
    }

    return {
      similarity: response.data.similarity,
      confidence: response.data.confidence,
      matched_frames: response.data.matched_frames
    }
  } catch (error) {
    const msg = error.response?.data?.error || error.message
    console.error(`❌ ML Service compare error: ${msg}`)
    throw new Error(`Feature comparison failed: ${msg}`)
  }
}
