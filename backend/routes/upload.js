/**
 * Upload Route
 * POST /api/upload - Accept video file, upload to Cloudinary, return URL.
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { uploadVideo } from '../services/cloudinaryService.js'
import { detectionStore } from '../utils/store.js'

const router = express.Router()

// ─── Multer Setup (Temp Storage) ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const videoTypes = /mp4|mov|avi|mkv|webm|flv|wmv/
    const ext = path.extname(file.originalname).toLowerCase().slice(1)
    if (videoTypes.test(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Only video files are allowed'), false)
    }
  }
})

// ─── POST /api/upload ───────────────────────────────────────────
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log(`📁 File received: ${file.originalname} (${(file.size / (1024*1024)).toFixed(1)} MB)`)

    // Upload to Cloudinary
    const result = await uploadVideo(file.path, file.originalname)

    // Clean up temp file
    try { fs.unlinkSync(file.path) } catch {}

    // Store content metadata for dashboard
    const contentItem = {
      id: detectionStore.contentList.length + 1,
      title: file.originalname.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      thumbnail: result.url.replace(/\.[^.]+$/, '.jpg'), // Cloudinary auto-generates thumbnails
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'active',
      matches: 0,
      videoUrl: result.url,
      publicId: result.publicId
    }
    detectionStore.contentList.push(contentItem)

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: result.url,
      contentId: contentItem.id,
      fileName: file.originalname
    })

  } catch (error) {
    // Clean up temp file on error
    if (req.file) {
      try { fs.unlinkSync(req.file.path) } catch {}
    }
    console.error('❌ Upload error:', error.message)
    res.status(500).json({ error: 'Upload failed', message: error.message })
  }
})

export default router