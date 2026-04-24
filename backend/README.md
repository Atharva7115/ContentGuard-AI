# ContentGuard AI - Backend API

Backend service for ContentGuard AI YouTube Content Monitoring System.

## Features

- Video upload and processing
- Content DNA generation
- YouTube search integration
- Similarity detection
- Automated monitoring

## Tech Stack

- Node.js + Express
- YouTube Data API v3
- Sharp (image processing)
- FFmpeg (video processing)
- Multer (file uploads)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## API Endpoints

### Upload
- `POST /api/upload` - Upload video file
- `POST /api/upload/extract-frames` - Extract frames from video
- `POST /api/upload/generate-dna` - Generate content DNA
- `POST /api/upload/generate-keywords` - Generate keywords

### YouTube
- `POST /api/youtube/search` - Search YouTube
- `GET /api/youtube/video/:videoId` - Get video details
- `POST /api/youtube/monitor` - Start monitoring

### Detection
- `POST /api/detect/similarity` - Calculate similarity
- `GET /api/detect/matches/:contentId` - Get matches
- `PATCH /api/detect/matches/:matchId` - Update match status

### Health
- `GET /api/health` - Health check

## Project Structure

```
backend/
├── routes/           # API routes
├── controllers/      # Request handlers
├── services/         # Business logic
├── utils/           # Helper functions
├── server.js        # Entry point
└── package.json     # Dependencies
```

## Requirements

- Node.js 18+
- FFmpeg (for video processing)
- YouTube API key
