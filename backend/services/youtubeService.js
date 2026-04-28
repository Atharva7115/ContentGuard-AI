/**
 * YouTube Service
 * Searches YouTube for videos matching keywords using the YouTube Data API v3.
 */

import { google } from 'googleapis'
import dotenv from 'dotenv'
dotenv.config()

let youtube = null

if (process.env.YOUTUBE_API_KEY) {
  youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
  })
}

/**
 * Search YouTube for videos matching keywords.
 * @param {string[]} keywords - Search keywords
 * @param {number} maxResults - Max number of results (default 5)
 * @returns {Array<{ videoId, title, channel, thumbnail }>}
 */
export const searchVideos = async (keywords, maxResults = 5) => {
  try {
    if (!youtube) {
      console.warn('⚠️  YouTube API key not configured, returning mock results')
      return generateMockSearchResults(keywords, maxResults)
    }

    const searchQuery = keywords.join(' ')
    console.log(`🔎 YouTube search: "${searchQuery}"`)

    const response = await youtube.search.list({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults,
      order: 'relevance'
    })

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url
    }))
  } catch (error) {
    console.error('YouTube search error:', error.message)
    // Return mock data if API fails (quota exceeded, etc.)
    return generateMockSearchResults(keywords, maxResults)
  }
}

/**
 * Fetch detailed information about a video.
 * @param {string} videoId
 */
export const fetchVideoDetails = async (videoId) => {
  try {
    if (!youtube) return generateMockVideoDetails(videoId)

    const response = await youtube.videos.list({
      part: 'snippet,statistics,contentDetails',
      id: videoId
    })

    const video = response.data.items[0]
    return {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channel: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.high?.url,
      viewCount: video.statistics.viewCount,
      duration: video.contentDetails.duration
    }
  } catch (error) {
    console.error('Video details error:', error.message)
    return generateMockVideoDetails(videoId)
  }
}

// ─── Mock Data (used when API key is missing) ───────────────────
const generateMockSearchResults = (keywords, maxResults) => {
  const titles = [
    'Championship Finals Highlights - Full Game',
    'Best Goals & Skills Compilation',
    'Match Recap and Analysis',
    'Season Review - Top Moments',
    'Behind The Scenes Documentary'
  ]

  return titles.slice(0, maxResults).map((title, i) => ({
    videoId: `mock_${Date.now()}_${i}`,
    title: `${keywords[0] || 'Content'} - ${title}`,
    description: `Video related to ${keywords.join(', ')}`,
    channel: `Channel_${i + 1}`,
    publishedAt: new Date().toISOString(),
    thumbnail: `https://images.unsplash.com/photo-${1461896836934 + i * 1000}?w=320&h=180&fit=crop`
  }))
}

const generateMockVideoDetails = (videoId) => ({
  videoId,
  title: 'Mock Video Title',
  description: 'Mock description',
  channel: 'Mock Channel',
  publishedAt: new Date().toISOString(),
  thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=640&h=360&fit=crop',
  viewCount: '10000',
  duration: 'PT10M30S'
})
