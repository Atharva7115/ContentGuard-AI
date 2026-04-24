import { v4 as uuidv4 } from 'uuid'
import { extractVideoFrames } from '../services/videoService.js'
import { generateDNA } from '../services/similarityService.js'
import { extractKeywords } from '../utils/keywordExtractor.js'

// Process uploaded video
export const processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const contentId = uuidv4()
    const filePath = req.file.path
    const fileName = req.file.originalname

    res.json({
      success: true,
      contentId,
      fileName,
      filePath,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed', message: error.message })
  }
}

// Extract frames from video
export const extractFrames = async (req, res) => {
  try {
    const { contentId, filePath } = req.body

    // Simulate frame extraction
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const frames = await extractVideoFrames(filePath)

    res.json({
      success: true,
      contentId,
      framesCount: frames.length,
      message: 'Frames extracted successfully'
    })
  } catch (error) {
    console.error('Frame extraction error:', error)
    res.status(500).json({ error: 'Frame extraction failed', message: error.message })
  }
}

// Generate content DNA
export const generateContentDNA = async (req, res) => {
  try {
    const { contentId, frames } = req.body

    // Simulate DNA generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const dna = await generateDNA(frames)

    res.json({
      success: true,
      contentId,
      dna,
      message: 'Content DNA generated successfully'
    })
  } catch (error) {
    console.error('DNA generation error:', error)
    res.status(500).json({ error: 'DNA generation failed', message: error.message })
  }
}

// Generate keywords
export const generateKeywords = async (req, res) => {
  try {
    const { contentId, fileName } = req.body

    // Simulate keyword generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const keywords = extractKeywords(fileName)

    res.json({
      success: true,
      contentId,
      keywords,
      message: 'Keywords generated successfully'
    })
  } catch (error) {
    console.error('Keyword generation error:', error)
    res.status(500).json({ error: 'Keyword generation failed', message: error.message })
  }
}
