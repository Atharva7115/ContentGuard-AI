# ContentGuard AI - Automated YouTube Content Monitoring System

A production-quality SaaS platform for monitoring and protecting original content from unauthorized use on YouTube.

## Project Structure

```
contentguard-ai/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
└── backend/           # Node.js + Express API
    ├── routes/
    ├── controllers/
    ├── services/
    ├── utils/
    └── package.json
```

## Features

- **AI-Powered Detection**: Advanced content DNA generation and similarity matching
- **Real-Time Monitoring**: Continuous scanning every 10 minutes
- **Smart Dashboard**: Clean, modern interface with activity feeds and analytics
- **Content Management**: Upload and track multiple pieces of content
- **Risk Assessment**: Automatic categorization of matches by similarity score
- **RESTful API**: Complete backend API for all operations

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5174`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your YouTube API key in .env
npm run dev
```

Backend runs on: `http://localhost:5000`

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts

### Backend
- Node.js + Express
- YouTube Data API v3
- Sharp (image processing)
- FFmpeg (video processing)
- Multer (file uploads)

## API Documentation

See `backend/README.md` for detailed API documentation.

## Environment Variables

### Backend (.env)
```
PORT=5000
YOUTUBE_API_KEY=your_api_key_here
NODE_ENV=development
```

## License

MIT
