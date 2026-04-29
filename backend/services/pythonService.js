/**
 * ML Service Client
 * Communicates with the deployed external ML service.
 *
 * Verified live endpoints (https://ccai3-ml.onrender.com):
 *   GET  /health  → { status: 'ok' }
 *   POST /extract → { success, frame_count, hashes, embeddings }
 *   POST /compare → { success, similarity, confidence, matched_frames }
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

// ─── Shared error normaliser ─────────────────────────────────────────────────

/**
 * Converts any axios error into a clean Error with an appropriate message.
 * Always throws — never returns.
 */
const throwMLError = (error, context) => {
  const status = error.response?.status
  const body   = error.response?.data

  if (status === 404) {
    console.error(`❌ [${context}] ML endpoint not found (404)`)
    const err = new Error('ML endpoint not found')
    err.status = 502
    throw err
  }

  if (!error.response) {
    // Network error — service unreachable (ECONNREFUSED, timeout, DNS, etc.)
    console.error(`❌ [${context}] ML service unreachable: ${error.message}`)
    const err = new Error('ML service unavailable')
    err.status = 502
    throw err
  }

  const msg = body?.error || body?.message || error.message || 'ML service unavailable'
  console.error(`❌ [${context}] ML service error (${status}): ${msg}`)
  const err = new Error(msg)
  err.status = 502
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

  let data
  try {
    const response = await mlClient.post('/extract', { videoUrl, isYouTube })
    data = response.data
  } catch (error) {
    throwMLError(error, 'extractFeatures')
  }

  if (!data.success) {
    const err = new Error(data.error || 'Feature extraction failed')
    err.status = 502
    throw err
  }

  console.log(`   ✅ Extracted ${data.frame_count} frames`)
  return {
    frame_count: data.frame_count,
    hashes:      data.hashes,
    embeddings:  data.embeddings,
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
  let data
  try {
    const response = await mlClient.post('/compare', {
      source: { hashes: sourceFeatures.hashes, embeddings: sourceFeatures.embeddings },
      target: { hashes: targetFeatures.hashes, embeddings: targetFeatures.embeddings },
    })
    data = response.data
  } catch (error) {
    throwMLError(error, 'compareFeatures')
  }

  if (!data.success) {
    const err = new Error(data.error || 'Comparison failed')
    err.status = 502
    throw err
  }

  return {
    similarity:     data.similarity,
    confidence:     data.confidence,
    matched_frames: data.matched_frames,
  }
}
