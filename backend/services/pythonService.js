/**
 * Python ML Service Client
 * HTTP client to communicate with the Python Flask ML service.
 */

import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

// Axios instance with reasonable timeouts
const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 180000,  // 3 minutes (CLIP + frame extraction can be slow)
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
 * 
 * @param {string} videoUrl - URL of the video
 * @param {boolean} isYouTube - Whether this is a YouTube video
 * @returns {{ frame_count: number, hashes: string[], embeddings: number[][] }}
 */
export const extractFeatures = async (videoUrl, isYouTube = false) => {
  try {
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
    const msg = error.response?.data?.error || error.message
    console.error(`❌ ML Service extract error: ${msg}`)
    throw new Error(`Feature extraction failed: ${msg}`)
  }
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
