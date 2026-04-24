import axios from 'axios'
import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

// Search YouTube for videos matching keywords
export const searchVideos = async (keywords, maxResults = 50) => {
  try {
    // If API key is not configured, return mock data
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, returning mock data')
      return generateMockSearchResults(keywords, maxResults)
    }

    const searchQuery = keywords.join(' ')
    
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
      thumbnail: item.snippet.thumbnails.medium.url
    }))
  } catch (error) {
    console.error('YouTube search error:', error)
    throw new Error('Failed to search YouTube')
  }
}

// Fetch detailed information about a video
export const fetchVideoDetails = async (videoId) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return generateMockVideoDetails(videoId)
    }

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
      thumbnail: video.snippet.thumbnails.high.url,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      duration: video.contentDetails.duration
    }
  } catch (error) {
    console.error('Video details error:', error)
    throw new Error('Failed to fetch video details')
  }
}

// Mock data generators for development
const generateMockSearchResults = (keywords, maxResults) => {
  const results = []
  for (let i = 0; i < Math.min(maxResults, 10); i++) {
    results.push({
      videoId: `mock_${i}_${Date.now()}`,
      title: `${keywords[0]} - Video ${i + 1}`,
      description: `Mock video result for ${keywords.join(', ')}`,
      channel: `Channel ${i + 1}`,
      publishedAt: new Date().toISOString(),
      thumbnail: `https://images.unsplash.com/photo-${1461896836934 + i}?w=320&h=180&fit=crop`
    })
  }
  return results
}

const generateMockVideoDetails = (videoId) => {
  return {
    videoId,
    title: 'Mock Video Title',
    description: 'Mock video description',
    channel: 'Mock Channel',
    publishedAt: new Date().toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=640&h=360&fit=crop',
    viewCount: '10000',
    likeCount: '500',
    duration: 'PT10M30S'
  }
}
