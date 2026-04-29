/**
 * Upload Route
 * POST /api/upload — Accept video file, upload to Cloudinary, return URL + contentId.
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { uploadVideo } from '../services/cloudinaryService.js'
import { detectionStore } from '../utils/store.js'

const router = express.Router()

// ─── Upload directory ────────────────────────────────────────────
// Use an absolute path so it works on both local and Render (ephemeral FS)
const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// ─── Multer ──────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})

const ALLOWED_EXTS  = /mp4|mov|avi|mkv|webm|flv|wmv/
const ALLOWED_MIMES = new Set([
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/webm', 'video/x-flv', 'video/x-ms-wmv',
])

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || String(2 * 1024 * 1024 * 1024)) },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1)
    if (ALLOWED_EXTS.test(ext) && (ALLOWED_MIMES.has(file.mimetype) || file.mimetype.startsWith('video/'))) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type "${ext}" (${file.mimetype}). Allowed: mp4, mov, avi, mkv, webm, flv, wmv`))
    }
  },
})

// ─── POST /api/upload ────────────────────────────────────────────
router.post('/', (req, res, next) => {
  // Run multer manually so we can return clean JSON on multer errors
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Upload error', message: err.message })
    }
    if (err) {
      return res.status(400).json({ error: 'Invalid file', message: err.message })
    }
    next()
  })
}, async (req, res) => {
  const file = req.file

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded', message: 'Attach a video file with field name "file"' })
  }

  console.log(`📁 Received: ${file.originalname} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`)

  try {
    const result = await uploadVideo(file.path, file.originalname)

    // Clean up temp file after Cloudinary upload
    try { fs.unlinkSync(file.path) } catch {}

    const contentItem = {
      id:         detectionStore.contentList.length + 1,
      title:      file.originalname.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      thumbnail:  result.url.replace(/\.[^.]+$/, '.jpg'),
      uploadDate: new Date().toISOString().split('T')[0],
      status:     'active',
      matches:    0,
      videoUrl:   result.url,
      publicId:   result.publicId,
    }
    detectionStore.contentList.push(contentItem)

    console.log(`✅ Uploaded to Cloudinary: ${result.url}`)

    return res.json({
      success:   true,
      message:   'File uploaded successfully',
      url:       result.url,
      contentId: contentItem.id,
      fileName:  file.originalname,
    })

  } catch (error) {
    try { fs.unlinkSync(file.path) } catch {}
    console.error('❌ Upload error:', error.message)
    return res.status(500).json({ error: 'Upload failed', message: error.message })
  }
})

export default router
