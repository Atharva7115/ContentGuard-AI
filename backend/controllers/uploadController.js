/**
 * Upload Controller
 * Handles file upload processing (now delegated to route + Cloudinary service).
 * Kept for potential future use with multi-step processing.
 */

import { v4 as uuidv4 } from 'uuid'

// Process uploaded video (called after Cloudinary upload)
export const processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const contentId = uuidv4()

    res.json({
      success: true,
      contentId,
      fileName: req.file.originalname,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed', message: error.message })
  }
}
