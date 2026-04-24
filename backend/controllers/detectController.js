import { calculateSimilarity } from '../services/similarityService.js'

// Detect similarity between original and found content
export const detectSimilarity = async (req, res) => {
  try {
    const { originalDNA, targetVideoId } = req.body

    if (!originalDNA || !targetVideoId) {
      return res.status(400).json({ error: 'Original DNA and target video ID are required' })
    }

    const similarity = await calculateSimilarity(originalDNA, targetVideoId)

    res.json({
      success: true,
      similarity,
      status: similarity >= 80 ? 'high' : similarity >= 60 ? 'medium' : 'low'
    })
  } catch (error) {
    console.error('Similarity detection error:', error)
    res.status(500).json({ error: 'Similarity detection failed', message: error.message })
  }
}

// Get all matches for a content piece
export const getMatches = async (req, res) => {
  try {
    const { contentId } = req.params

    // Mock data - in production, fetch from database
    const matches = [
      {
        id: 1,
        videoId: 'abc123',
        title: 'Championship Finals Highlights',
        channel: 'SportsClips HD',
        similarity: 94,
        status: 'high',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        videoId: 'def456',
        title: 'Game Recap',
        channel: 'FastSports',
        similarity: 87,
        status: 'high',
        timestamp: new Date().toISOString()
      }
    ]

    res.json({
      success: true,
      contentId,
      count: matches.length,
      matches
    })
  } catch (error) {
    console.error('Get matches error:', error)
    res.status(500).json({ error: 'Failed to fetch matches', message: error.message })
  }
}

// Update match status
export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params
    const { status, action } = req.body

    // In production, update database
    res.json({
      success: true,
      matchId,
      status,
      action,
      message: 'Match status updated successfully'
    })
  } catch (error) {
    console.error('Update match error:', error)
    res.status(500).json({ error: 'Failed to update match', message: error.message })
  }
}
