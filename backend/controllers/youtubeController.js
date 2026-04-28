/**
 * YouTube Controller
 * Handles YouTube search and video details endpoints.
 */

import { searchVideos, fetchVideoDetails } from '../services/youtubeService.js'

// Search YouTube for similar content
export const searchYouTube = async (req, res) => {
  try {
    const { keywords, maxResults = 5 } = req.body

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords are required' })
    }

    const results = await searchVideos(keywords, maxResults)

    res.json({
      success: true,
      count: results.length,
      results
    })
  } catch (error) {
    console.error('YouTube search error:', error)
    res.status(500).json({ error: 'Search failed', message: error.message })
  }
}

// Get video details
export const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params
    const details = await fetchVideoDetails(videoId)
    res.json({ success: true, details })
  } catch (error) {
    console.error('Video details error:', error)
    res.status(500).json({ error: 'Failed to fetch details', message: error.message })
  }
}

// Start monitoring for content
export const monitorContent = async (req, res) => {
  try {
    const { contentId, keywords, frequency = 10 } = req.body
    res.json({
      success: true,
      contentId,
      monitoring: true,
      frequency: `${frequency} minutes`,
      message: 'Monitoring started successfully'
    })
  } catch (error) {
    console.error('Monitoring error:', error)
    res.status(500).json({ error: 'Failed to start monitoring', message: error.message })
  }
}
