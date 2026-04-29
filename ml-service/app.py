"""
ContentGuard AI - Python ML Service
Flask API for video frame extraction, CLIP embeddings, pHash hashing, and similarity detection.

Production deployment: gunicorn app:app
Port binding: reads PORT env var (required by Render)
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── Logging ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger('ml-service')

# ─── Flask App ───────────────────────────────────────────────────
# app must be named 'app' at module level for gunicorn (gunicorn app:app)
app = Flask(__name__)
CORS(app)

# Temp directory for downloaded videos / extracted frames
TEMP_DIR = os.path.join(os.path.dirname(__file__), 'temp')
os.makedirs(TEMP_DIR, exist_ok=True)

# ─── Lazy-import heavy services so gunicorn workers start fast ───
# CLIP model is loaded on first request, not at import time.
# This prevents Render's 60-second boot timeout from killing the process.

def _get_services():
    from services.frame_extractor import extract_frames_from_url
    from services.embedding import compute_embeddings
    from services.hashing import compute_phashes
    from services.similarity import compute_similarity
    return extract_frames_from_url, compute_embeddings, compute_phashes, compute_similarity


# ─── Routes ──────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Health check — used by Render and backend to verify service is up."""
    return jsonify({
        'status': 'ok',
        'service': 'ContentGuard AI ML Service',
        'version': '1.0.0'
    })


@app.route('/extract', methods=['POST'])
def extract_features():
    """
    Extract frames, pHash hashes, and CLIP embeddings from a video URL.

    Request JSON:
        { "videoUrl": "https://...", "isYouTube": false }

    Response JSON:
        { "success": true, "frame_count": 6, "hashes": [...], "embeddings": [[...], ...] }
    """
    try:
        data = request.get_json(silent=True) or {}
        video_url  = data.get('videoUrl')
        is_youtube = data.get('isYouTube', False)

        if not video_url:
            return jsonify({'success': False, 'error': 'videoUrl is required'}), 400

        logger.info(f'Extracting features: {video_url} (YouTube: {is_youtube})')

        extract_frames_from_url, compute_embeddings, compute_phashes, _ = _get_services()

        frame_paths = extract_frames_from_url(video_url, TEMP_DIR, is_youtube=is_youtube)

        if not frame_paths:
            return jsonify({'success': False, 'error': 'No frames could be extracted'}), 400

        hashes     = compute_phashes(frame_paths)
        embeddings = compute_embeddings(frame_paths)

        # Clean up temp frames
        for fp in frame_paths:
            try:
                os.remove(fp)
            except OSError:
                pass

        logger.info(f'Extracted {len(frame_paths)} frames, {len(hashes)} hashes, {len(embeddings)} embeddings')

        return jsonify({
            'success':     True,
            'frame_count': len(frame_paths),
            'hashes':      hashes,
            'embeddings':  embeddings,
        })

    except Exception as e:
        logger.error(f'/extract failed: {e}', exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/compare', methods=['POST'])
def compare_features():
    """
    Compare two feature sets and return a similarity score.

    Request JSON:
        {
            "source": { "hashes": [...], "embeddings": [[...], ...] },
            "target": { "hashes": [...], "embeddings": [[...], ...] }
        }

    Response JSON:
        { "success": true, "similarity": 87.5, "confidence": "high", "matched_frames": 4 }
    """
    try:
        data   = request.get_json(silent=True) or {}
        source = data.get('source')
        target = data.get('target')

        if not source or not target:
            return jsonify({'success': False, 'error': 'source and target are required'}), 400

        _, _, _, compute_similarity = _get_services()

        result = compute_similarity(source, target)

        logger.info(
            f'Similarity: {result["similarity"]:.1f}% | '
            f'Confidence: {result["confidence"]} | '
            f'Matched frames: {result["matched_frames"]}'
        )

        return jsonify({'success': True, **result})

    except Exception as e:
        logger.error(f'/compare failed: {e}', exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── Entry point (local dev only) ────────────────────────────────
# On Render, gunicorn runs: gunicorn app:app
# PORT env var is injected by Render automatically.

if __name__ == '__main__':
    port = int(os.environ.get('PORT', os.environ.get('ML_SERVICE_PORT', 5001)))
    logger.info(f'Starting ML Service on port {port} (dev mode)')
    app.run(host='0.0.0.0', port=port, debug=False)
