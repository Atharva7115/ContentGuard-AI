import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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
