/**
 * Gemini Service
 * Uses Google Generative AI (Gemini) to extract search keywords from video context.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractKeywords } from '../utils/keywordExtractor.js'
import dotenv from 'dotenv'
dotenv.config()

let genAI = null

// Initialize Gemini if API key is available
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

/**
 * Extract YouTube search keywords from video context using Gemini.
 * Falls back to basic keyword extraction if Gemini is unavailable.
 * 
 * @param {string} videoContext - Video filename, title, or description
 * @returns {string[]} Array of search keywords
 */
export const extractKeywordsWithGemini = async (videoContext) => {
  // Fallback if Gemini is not configured
  if (!genAI) {
    console.warn('⚠️  Gemini API not configured, using basic keyword extraction')
    return extractKeywords(videoContext)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a content analysis assistant. Given the following video title/filename/context, generate 5-8 YouTube search keywords or short phrases that would help find similar or re-uploaded versions of this video on YouTube.

Video context: "${videoContext}"

Rules:
- Return ONLY a JSON array of strings
- Each keyword should be 1-4 words
- Include specific terms from the title
- Include broader category terms
- Include common re-upload patterns (e.g., "highlights", "compilation", "recap")
- Do NOT include generic terms like "video" or "youtube"

Example output format:
["football goal", "Messi penalty", "match highlights", "championship finals", "game recap"]

Generate keywords now:`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Parse JSON array from response
    const jsonMatch = text.match(/\[.*\]/s)
    if (jsonMatch) {
      const keywords = JSON.parse(jsonMatch[0])
      console.log(`🤖 Gemini keywords: ${keywords.join(', ')}`)
      return keywords.slice(0, 8)
    }

    // If parsing fails, fall back
    console.warn('⚠️  Could not parse Gemini response, using fallback')
    return extractKeywords(videoContext)

  } catch (error) {
    console.error('❌ Gemini API error:', error.message)
    return extractKeywords(videoContext)
  }
}
