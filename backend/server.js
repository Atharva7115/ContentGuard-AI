import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import uploadRoutes from './routes/upload.js'
import youtubeRoutes from './routes/youtube.js'
import detectRoutes from './routes/detect.js'
import { detectionStore } from './utils/store.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))  // Large limit for embedding payloads
app.use(express.urlencoded({ extended: true }))

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit uploads to 10 per hour per IP
  message: 'Too many uploads from this IP, please try again later.',
})

const detectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit detection requests to 20 per 15 minutes
  message: 'Too many detection requests, please try again later.',
})

// Apply rate limiting
app.use('/api/', limiter)
app.use('/api/upload', uploadLimiter)
app.use('/api/detect', detectLimiter)

// Routes
app.use('/api/upload', uploadRoutes)
app.use('/api/youtube', youtubeRoutes)
app.use('/api/detect', detectRoutes)

// GET /api/stats - Dashboard statistics
app.get('/api/stats', (req, res) => {
  const today = new Date().toDateString()
  const todayResults = (detectionStore.results || []).filter(
    r => r.timestamp && new Date(r.timestamp).toDateString() === today
  )
  const highRisk = todayResults.filter(r => r.status === 'high').length

  res.json({
    matchesToday: todayResults.length || detectionStore.results.length,
    highRisk: highRisk || detectionStore.results.filter(r => r.status === 'high').length,
    monitoring: detectionStore.contentList.length > 0 ? 'Active' : 'Idle'
  })
})

// GET /api/activity - Activity feed
app.get('/api/activity', (req, res) => {
  res.json(detectionStore.activities.slice(0, 10))
})

// GET /api/content - List of uploaded/monitored content
app.get('/api/content', (req, res) => {
  res.json(detectionStore.contentList)
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ContentGuard AI API is running' })
})

// POST /api/predict - Proxy to external ML service
app.post('/api/predict', async (req, res) => {
  const ML_PREDICT_URL = process.env.ML_PREDICT_URL || 'https://ccai3-ml.onrender.com/predict'

  try {
    const mlResponse = await fetch(ML_PREDICT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    const data = await mlResponse.json().catch(() => null)

    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json({
        error: 'ML service error',
        message: data?.message || data?.error || `ML service returned ${mlResponse.status}`,
      })
    }

    return res.json(data)
  } catch (error) {
    console.error('❌ /api/predict proxy error:', error.message)
    return res.status(502).json({
      error: 'ML service unreachable',
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  })
})

app.listen(PORT, () => {
  console.log(`🚀 ContentGuard AI Backend running on port ${PORT}`)
})
