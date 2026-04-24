import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import uploadRoutes from './routes/upload.js'
import youtubeRoutes from './routes/youtube.js'
import detectRoutes from './routes/detect.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/upload', uploadRoutes)
app.use('/api/youtube', youtubeRoutes)
app.use('/api/detect', detectRoutes)

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
