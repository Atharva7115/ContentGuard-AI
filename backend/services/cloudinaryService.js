/**
 * Cloudinary Service
 * Handles video upload to Cloudinary and returns public URLs.
 */

import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

// ─── Configure Cloudinary ───────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a video file to Cloudinary.
 * @param {string} filePath - Local path to the video file
 * @param {string} originalName - Original filename for context
 * @returns {{ url: string, publicId: string, duration: number }}
 */
export const uploadVideo = async (filePath, originalName = '') => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn('⚠️  Cloudinary not configured, using local file path as URL')
      return {
        url: `file://${filePath}`,
        publicId: `local_${Date.now()}`,
        duration: 0
      }
    }

    console.log(`☁️  Uploading to Cloudinary: ${originalName}`)

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'contentguard',
      // Use auto format for optimal delivery
      format: 'mp4',
      // Set a reasonable timeout for large files
      timeout: 120000,
    })

    console.log(`✅ Cloudinary upload complete: ${result.secure_url}`)

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message)
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

/**
 * Delete a video from Cloudinary.
 * @param {string} publicId - Cloudinary public ID
 */
export const deleteVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
    console.log(`🗑️  Deleted from Cloudinary: ${publicId}`)
  } catch (error) {
    console.error('Delete error:', error.message)
  }
}
