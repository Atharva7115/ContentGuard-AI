# ContentGuard AI - Automated YouTube Content Monitoring System

## 🌐 Live Demo

👉 [Live Demo Link] : https://ccai3-7xk4n36o2-sameer4445s-projects.vercel.app

> ⚠️ **Note:** The live deployment is hosted from a parallel repository due to initial collaboration access issues.  
> Both repositories contain identical code and commit history, and represent the same project.

A production-quality SaaS platform for monitoring and protecting original content from unauthorized use on YouTube.

## 📌 Repository Note

This repository serves as the primary submission repository.  
The deployed version is hosted from a mirrored repository used during development due to access constraints.

All code, commits, and functionality are consistent across both repositories.

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
