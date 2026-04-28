/**
 * Detect Route
 * POST /api/detect - Full similarity detection pipeline.
 * GET  /api/detect/matches/:contentId - Get matches for a content piece.
 */

import express from 'express'
import { runDetectionPipeline } from '../controllers/detectController.js'
import { detectionStore } from '../utils/store.js'

const router = express.Router()

// ─── POST /api/detect ───────────────────────────────────────────
// Full pipeline: extract features → Gemini keywords → YouTube search → compare
router.post('/', runDetectionPipeline)

// ─── GET /api/detect/matches/:contentId ─────────────────────────
// Return stored matches for a specific content piece
router.get('/matches/:contentId', (req, res) => {
  const contentId = parseInt(req.params.contentId)
  const matches = detectionStore.results.filter(r => r.contentId === contentId)

  res.json({
    success: true,
    contentId,
    count: matches.length,
    matches
  })
})

export default router
