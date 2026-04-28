# ContentGuard AI – Backend + ML Service Implementation Plan

Build a production-quality backend system (Node.js + Python ML service) and integrate it with the existing React frontend to create a real video content similarity detection pipeline.

## Current State Analysis

### Frontend (React + Vite + Tailwind) — ✅ Complete
- 5 pages: Dashboard, Monitoring, Upload, Guide, Settings
- 6 reusable components: Layout, Card, Badge, StatCard, ActivityItem, MatchesChart
- All data is **mock** — `mockData.js` generates static arrays, Upload uses `setTimeout`

### Backend (Node.js/Express) — ⚠️ Skeleton/Mock
- Upload route uses **Google Cloud Storage** (needs → Cloudinary)
- Similarity service returns **random values** (`Math.random()`)
- Video service returns **mock frame arrays** (no real FFmpeg)
- Keyword extractor is **basic string splitting** (needs → Gemini API)
- YouTube service has real API code but falls back to mock data

### Python ML Service — ❌ Does Not Exist
- No CLIP embeddings, no pHash, no FAISS, no frame extraction

---

## User Review Required

> [!IMPORTANT]
> **API Keys Required** — The user must provide:
> - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
> - `GEMINI_API_KEY` (Google Generative AI)
> - `YOUTUBE_API_KEY` (YouTube Data API v3)
>
> These will be placed in `backend/.env`. Without them, the system will use graceful fallbacks but won't produce real results.

> [!WARNING]
> **FFmpeg Dependency** — The Python ML service requires FFmpeg installed on the system PATH. On Windows: `winget install ffmpeg` or download from ffmpeg.org.

> [!WARNING]
> **CLIP Model Download** — First run of the Python ML service will download the `openai/clip-vit-base-patch32` model (~600MB). This is a one-time download.

---

## Open Questions

> [!IMPORTANT]
> **YouTube video download**: To extract frames from YouTube videos for comparison, we need to download them. Should we use `yt-dlp` (which may violate YouTube ToS in some jurisdictions), or should we only compare against YouTube **thumbnail** images as a simpler alternative? **I'll implement yt-dlp by default** as specified in the requirements, but this can be toggled.

---

## Proposed Changes

### Component 1: Python ML Service (NEW)

All new files under `/ml-service/`. This is a Flask-based REST API that handles frame extraction, hashing, embedding generation, and similarity computation.

#### [NEW] [requirements.txt](file:///c:/Users/HP/Desktop/solution/ml-service/requirements.txt)
- Dependencies: `flask`, `torch`, `transformers`, `Pillow`, `imagehash`, `faiss-cpu`, `numpy`, `scipy`, `yt-dlp`

#### [NEW] [app.py](file:///c:/Users/HP/Desktop/solution/ml-service/app.py)
- Flask app with two endpoints:
  - `POST /extract` — Takes a video URL, extracts frames, computes pHash + CLIP embeddings, returns them
  - `POST /compare` — Takes two sets of embeddings+hashes, returns similarity scores
- Health check at `GET /health`

#### [NEW] [services/frame_extractor.py](file:///c:/Users/HP/Desktop/solution/ml-service/services/frame_extractor.py)
- `extract_frames(video_path, num_frames=6)` — Uses FFmpeg via subprocess to extract 6 uniformly-sampled frames from a video
- `download_video(url, output_dir)` — Downloads video from URL (Cloudinary or YouTube via yt-dlp)
- Frames saved as temporary JPEGs

#### [NEW] [services/hashing.py](file:///c:/Users/HP/Desktop/solution/ml-service/services/hashing.py)
- `compute_phash(image_path)` — Computes perceptual hash using `imagehash.phash()`
- `compute_hash_similarity(hash1, hash2)` — Hamming distance normalized to 0-1 similarity
- Returns hex string representation of hashes

#### [NEW] [services/embedding.py](file:///c:/Users/HP/Desktop/solution/ml-service/services/embedding.py)
- Loads CLIP model (`openai/clip-vit-base-patch32`) at startup (singleton)
- `compute_embeddings(image_paths)` — Batch process images through CLIP, returns list of 512-dim float vectors
- Uses `CLIPProcessor` + `CLIPModel` from transformers

#### [NEW] [services/similarity.py](file:///c:/Users/HP/Desktop/solution/ml-service/services/similarity.py)
- `compute_similarity(source_data, target_data)` — Main comparison function
  - For each pair of frames: compute cosine similarity (embeddings) + hash similarity
  - Combined score: `0.7 * embedding_similarity + 0.3 * hash_similarity`
  - Final score: MAX of all frame-pair similarities
  - Requires ≥2 frame pairs above threshold for "high" confidence
- Returns: `{ similarity: float, confidence: str, matched_frames: int }`

#### [NEW] [services/faiss_index.py](file:///c:/Users/HP/Desktop/solution/ml-service/services/faiss_index.py)
- `build_index(embeddings)` — Creates a FAISS L2 index from embedding vectors for fast nearest-neighbor search
- `search_index(index, query_embeddings, k=5)` — Searches index for top-k similar vectors
- Used as a fast pre-filter before detailed cosine similarity

---

### Component 2: Node.js Backend (REWRITE)

Major rewrite of existing backend files. Replace mock logic with real service calls.

#### [MODIFY] [package.json](file:///c:/Users/HP/Desktop/solution/backend/package.json)
- Add dependencies: `cloudinary`, `@google/generative-ai`
- Remove: `@google-cloud/storage`, `sharp` (no longer needed in Node — Python handles image processing)

#### [MODIFY] [.env.example](file:///c:/Users/HP/Desktop/solution/backend/.env.example)
- Add Cloudinary, Gemini, Python ML service URL variables

#### [MODIFY] [server.js](file:///c:/Users/HP/Desktop/solution/backend/server.js)
- Add `/api/detect` as POST route (not nested under `/api/detect/similarity`)
- Add `/api/stats`, `/api/activity`, `/api/content` routes for dashboard/monitoring data
- Increase JSON body limit for large embedding payloads

#### [NEW] [services/cloudinaryService.js](file:///c:/Users/HP/Desktop/solution/backend/services/cloudinaryService.js)
- Configure Cloudinary SDK with env vars
- `uploadVideo(filePath)` — Upload video to Cloudinary, return public URL
- `deleteVideo(publicId)` — Cleanup uploaded video

#### [NEW] [services/geminiService.js](file:///c:/Users/HP/Desktop/solution/backend/services/geminiService.js)
- Initialize `@google/generative-ai` with API key
- `extractKeywords(videoContext)` — Send filename/context to Gemini, ask for 5-8 search keywords
- Prompt engineering: "Given this video title/context, generate YouTube search keywords for finding similar or re-uploaded content"
- Fallback to basic keyword extraction if API fails

#### [NEW] [services/pythonService.js](file:///c:/Users/HP/Desktop/solution/backend/services/pythonService.js)
- HTTP client to communicate with Python ML service
- `extractFeatures(videoUrl)` — POST to `/extract`, returns `{ embeddings, hashes, frame_count }`
- `compareSimilarity(sourceData, targetData)` — POST to `/compare`, returns similarity result
- Timeout handling and retry logic

#### [MODIFY] [services/youtubeService.js](file:///c:/Users/HP/Desktop/solution/backend/services/youtubeService.js)
- Keep existing YouTube API integration (already works)
- Clean up mock fallback — still useful for development without API key
- Ensure it returns `videoId`, `title`, `thumbnail`, `url` fields

#### [MODIFY] [routes/upload.js](file:///c:/Users/HP/Desktop/solution/backend/routes/upload.js)
- Replace Google Cloud Storage with Cloudinary upload
- Accept multipart file via multer → upload to Cloudinary → return URL
- Clean up temp file after upload

#### [MODIFY] [routes/detect.js](file:///c:/Users/HP/Desktop/solution/backend/routes/detect.js)
- Single `POST /` endpoint that orchestrates the full pipeline:
  1. Call Python service → extract features from source video
  2. Call Gemini → generate keywords
  3. Call YouTube API → fetch candidate videos
  4. For each candidate: call Python service → extract features
  5. Compare source vs each candidate → compute similarity
  6. Return sorted results array

#### [MODIFY] [controllers/detectController.js](file:///c:/Users/HP/Desktop/solution/backend/controllers/detectController.js)
- Rewrite `detectSimilarity` to orchestrate the real pipeline
- Remove all mock data arrays
- Add proper error handling and progress logging

#### [MODIFY] [controllers/uploadController.js](file:///c:/Users/HP/Desktop/solution/backend/controllers/uploadController.js)
- Replace mock processing with Cloudinary upload call
- Remove `setTimeout` delays

#### [DELETE] [services/similarityService.js](file:///c:/Users/HP/Desktop/solution/backend/services/similarityService.js)
- All similarity computation moves to Python ML service

#### [DELETE] [services/videoService.js](file:///c:/Users/HP/Desktop/solution/backend/services/videoService.js)
- Frame extraction moves to Python ML service

#### [MODIFY] [utils/keywordExtractor.js](file:///c:/Users/HP/Desktop/solution/backend/utils/keywordExtractor.js)
- Keep as fallback when Gemini API is unavailable
- Primary keyword extraction now done via Gemini service

---

### Component 3: Frontend Integration (MINIMAL CHANGES)

**No UI/styling changes.** Only replace mock data calls with real API calls.

#### [MODIFY] [vite.config.js](file:///c:/Users/HP/Desktop/solution/frontend/vite.config.js)
- Add proxy config: `/api` → `http://localhost:5000` (avoids CORS during development)

#### [NEW] [src/utils/api.js](file:///c:/Users/HP/Desktop/solution/frontend/src/utils/api.js)
- Centralized API client with `BASE_URL`
- `uploadVideo(file)` — POST to `/api/upload` with FormData
- `detectSimilarity(videoUrl)` — POST to `/api/detect`
- `fetchStats()` — GET `/api/stats`
- `fetchActivity()` — GET `/api/activity`
- `fetchContent()` — GET `/api/content`
- `fetchMatches(contentId)` — GET `/api/detect/matches/:contentId`

#### [MODIFY] [src/pages/Upload.jsx](file:///c:/Users/HP/Desktop/solution/frontend/src/pages/Upload.jsx)
- Replace `handleUpload` internals:
  - `setTimeout` → `api.uploadVideo(file)` for upload step
  - After upload, call `api.detectSimilarity(videoUrl)` for processing
  - Keep existing step progress UI structure (still shows 4 steps)
  - Store results for navigation to Monitoring page
- Add error state handling
- **No visual changes**

#### [MODIFY] [src/pages/Dashboard.jsx](file:///c:/Users/HP/Desktop/solution/frontend/src/pages/Dashboard.jsx)
- Replace `generateActivityFeed()` with `api.fetchActivity()` in useEffect
- Replace hardcoded `stats` with `api.fetchStats()`
- Keep existing `setInterval` for polling (now polls real API)
- Graceful fallback to mock data if API is unreachable
- **No visual changes**

#### [MODIFY] [src/pages/Monitoring.jsx](file:///c:/Users/HP/Desktop/solution/frontend/src/pages/Monitoring.jsx)
- Replace `monitoredContent` import with `api.fetchContent()` in useEffect
- Replace `generateMockMatches()` with `api.fetchMatches(contentId)`
- Update when selectedContent changes
- **No visual changes**

#### [KEEP] [src/utils/mockData.js](file:///c:/Users/HP/Desktop/solution/frontend/src/utils/mockData.js)
- Keep as fallback data when backend is unreachable
- Dashboard/Monitoring will use it if API calls fail

---

## Verification Plan

### Automated Tests

1. **Python ML service**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   python app.py
   # Test health: curl http://localhost:5001/health
   ```

2. **Node.js backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   # Test health: curl http://localhost:5000/api/health
   # Test upload: curl -X POST -F "file=@test.mp4" http://localhost:5000/api/upload
   ```

3. **Full pipeline test**:
   ```bash
   # Upload a video, then detect
   curl -X POST http://localhost:5000/api/detect -H "Content-Type: application/json" -d '{"videoUrl": "<cloudinary-url>"}'
   ```

4. **Frontend integration**:
   ```bash
   cd frontend
   npm run dev
   # Open browser, upload a video, verify processing steps show real progress
   ```

### Manual Verification
- Upload a short video clip via the UI
- Verify frames are extracted (check Python service logs)
- Verify Gemini returns keywords (check Node.js logs)
- Verify YouTube results appear in Monitoring page
- Verify similarity scores are real (not random)
