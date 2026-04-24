import express from 'express'
import { 
  detectSimilarity, 
  getMatches, 
  updateMatchStatus 
} from '../controllers/detectController.js'

const router = express.Router()

// Detect similarity between content
router.post('/similarity', detectSimilarity)

// Get all matches for a content piece
router.get('/matches/:contentId', getMatches)

// Update match status (reviewed, flagged, etc.)
router.patch('/matches/:matchId', updateMatchStatus)

export default router
