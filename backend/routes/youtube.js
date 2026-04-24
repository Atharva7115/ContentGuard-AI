import express from 'express'
import { 
  searchYouTube, 
  getVideoDetails, 
  monitorContent 
} from '../controllers/youtubeController.js'

const router = express.Router()

// Search YouTube for similar content
router.post('/search', searchYouTube)

// Get video details
router.get('/video/:videoId', getVideoDetails)

// Start monitoring for a content piece
router.post('/monitor', monitorContent)

export default router
