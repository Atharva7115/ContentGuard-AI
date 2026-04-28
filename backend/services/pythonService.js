/**
 * ML Service Client
 * Forwards requests to the deployed external ML service.
 * ML Service URL: https://ccai3-ml.onrender.com/predict
 */

import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const ML_PREDICT_URL = process.env.ML_PREDICT_URL || 'https://ccai3-ml.onrender.com/predict'
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || '180000', 10)

const mlClient = axios.create({
  timeout: ML_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Send a prediction request to the external ML service.
 *
 * @param {object} payload - Request body to forward
 * @returns {object} ML service response data
 */
export const callMLService = async (payload) => {
  try {
    const response = await mlClient.post(ML_PREDICT_URL, payload)
    return response.data
  } catch (error) {
    const status = error.response?.status
    const msg = error.response?.data?.error || error.response?.data?.message || error.message
    console.error(`❌ ML service error (${status || 'no response'}): ${msg}`)
    const err = new Error(msg || 'ML service unavailable')
    err.status = status || 502
    throw err
  }
}

/**
 * Extract features from a video URL via the ML service.
 *
 * @param {string} videoUrl
 * @param {boolean} isYouTube
 * @returns {object} { frame_count, hashes, embeddings }
 */
export const extractFeatures = async (videoUrl, isYouTube = false) => {
  console.log(`🔬 Extracting features: ${videoUrl} (YouTube: ${isYouTube})`)
  const data = await callMLService({ action: 'extract', videoUrl, isYouTube })

  if (!data.success) {
    throw new Error(data.error || 'Feature extraction failed')
  }

  return {
    frame_count: data.frame_count,
    hashes: data.hashes,
    embeddings: data.embeddings,
  }
}

/**
 * Compare two feature sets via the ML service.
 *
 * @param {object} sourceFeatures - { hashes, embeddings }
 * @param {object} targetFeatures - { hashes, embeddings }
 * @returns {object} { similarity, confidence, matched_frames }
 */
export const compareFeatures = async (sourceFeatures, targetFeatures) => {
  const data = await callMLService({
    action: 'compare',
    source: { hashes: sourceFeatures.hashes, embeddings: sourceFeatures.embeddings },
    target: { hashes: targetFeatures.hashes, embeddings: targetFeatures.embeddings },
  })

  if (!data.success) {
    throw new Error(data.error || 'Comparison failed')
  }

  return {
    similarity: data.similarity,
    confidence: data.confidence,
    matched_frames: data.matched_frames,
  }
}
