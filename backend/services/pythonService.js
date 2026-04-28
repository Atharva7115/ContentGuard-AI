/**
 * ML Service Client
 * Communicates with the deployed external ML service.
 *
 * Verified live endpoints (https://ccai3-ml.onrender.com):
 *   GET  /health   → { status: 'ok' }
 *   POST /extract  → { success, frame_count, hashes, embeddings }
 *   POST /compare  → { success, similarity, confidence, matched_frames }
 *
 * NOTE: /predict does NOT exist on this service — use /extract and /compare.
 */

import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const ML_BASE_URL = process.env.ML_BASE_URL || 'https://ccai3-ml.onrender.com'
const ML_TIMEOUT  = parseInt(process.env.ML_TIMEOUT_MS || '180000', 10)

const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  timeout: ML_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Shared error handler ────────────────────────────────────────────────────

const handleMLError = (error, context) => {
  const status = error.response?.status
  const body   = error.response?.data

  // 404 means the route doesn't exist on the ML service
  if (status === 404) {
    console.error(`❌ ML endpoint not found (404) [${context}]`)
    const err = new Error('ML endpoint not found')
    err.status = 502
    throw err
  }

  const msg = body?.error || body?.message || error.message || 'ML service unavailable'
  console.error(`❌ ML service error (${status || 'no response'}) [${context}]: ${msg}`)
  const err = new Error(msg)
  err.status = status || 502
  throw err
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Extract frames, hashes, and CLIP embeddings from a video URL.
 *
 * POST /extract
 * Body: { videoUrl: string, isYouTube: boolean }
 *
 * @param {string}  videoUrl
 * @param {boolean} isYouTube
 * @returns {{ frame_count: number, hashes: string[], embeddings: number[][] }}
 */
export const extractFeatures = async (videoUrl, isYouTube = false) => {
  console.log(`🔬 Extracting features: ${videoUrl} (YouTube: ${isYouTube})`)

  try {
    const { data } = await mlClient.post('/extract', { videoUrl, isYouTube })

    if (!data.success) {
      throw new Error(data.error || 'Feature extraction failed')
    }

    console.log(`   ✅ Extracted ${data.frame_count} frames`)
    return {
      frame_count: data.frame_count,
      hashes:      data.hashes,
      embeddings:  data.embeddings,
    }
  } catch (error) {
    if (error.response !== undefined) handleMLError(error, 'extractFeatures')
    throw error  // re-throw errors we already formatted
  }
}

/**
 * Compare two feature sets and return a similarity score.
 *
 * POST /compare
 * Body: { source: { hashes, embeddings }, target: { hashes, embeddings } }
 *
 * @param {{ hashes: string[], embeddings: number[][] }} sourceFeatures
 * @param {{ hashes: string[], embeddings: number[][] }} targetFeatures
 * @returns {{ similarity: number, confidence: string, matched_frames: number }}
 */
export const compareFeatures = async (sourceFeatures, targetFeatures) => {
  try {
    const { data } = await mlClient.post('/compare', {
      source: { hashes: sourceFeatures.hashes, embeddings: sourceFeatures.embeddings },
      target: { hashes: targetFeatures.hashes, embeddings: targetFeatures.embeddings },
    })

    if (!data.success) {
      throw new Error(data.error || 'Comparison failed')
    }

    return {
      similarity:     data.similarity,
      confidence:     data.confidence,
      matched_frames: data.matched_frames,
    }
  } catch (error) {
    if (error.response !== undefined) handleMLError(error, 'compareFeatures')
    throw error
  }
}
