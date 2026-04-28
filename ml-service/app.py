"""
ContentGuard AI - Python ML Service
Flask API for video frame extraction, CLIP embeddings, pHash hashing, and similarity detection.
"""

import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.frame_extractor import extract_frames_from_url
from services.embedding import compute_embeddings
from services.hashing import compute_phashes
from services.similarity import compute_similarity

# ─── Logging Setup ───────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger('ml-service')


# ─── Flask App ───────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# Temp directory for downloaded videos and extracted frames
TEMP_DIR = os.path.join(os.path.dirname(__file__), 'temp')
os.makedirs(TEMP_DIR, exist_ok=True)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'ContentGuard AI ML Service',
        'version': '1.0.0'
    })


@app.route('/extract', methods=['POST'])
def extract_features():
    """
    Extract frames, compute pHash and CLIP embeddings from a video URL.
    
    Input JSON:
        { "videoUrl": "https://...", "isYouTube": false }
    
    Returns JSON:
        {
            "success": true,
            "frame_count": 6,
            "hashes": ["abc123...", ...],
            "embeddings": [[0.1, 0.2, ...], ...],
        }
    """
    try:
        data = request.get_json()
        video_url = data.get('videoUrl')
        is_youtube = data.get('isYouTube', False)

        if not video_url:
            return jsonify({'error': 'videoUrl is required'}), 400

        logger.info(f'Extracting features from: {video_url} (YouTube: {is_youtube})')

        # Step 1: Download video and extract frames
        frame_paths = extract_frames_from_url(video_url, TEMP_DIR, is_youtube=is_youtube)
        logger.info(f'Extracted {len(frame_paths)} frames')

        if not frame_paths:
            return jsonify({'error': 'No frames could be extracted'}), 400

        # Step 2: Compute perceptual hashes for each frame
        hashes = compute_phashes(frame_paths)
        logger.info(f'Computed {len(hashes)} perceptual hashes')

        # Step 3: Compute CLIP embeddings for each frame
        embeddings = compute_embeddings(frame_paths)
        logger.info(f'Computed {len(embeddings)} CLIP embeddings')

        # Step 4: Cleanup temporary frame files
        for fp in frame_paths:
            try:
                os.remove(fp)
            except OSError:
                pass

        return jsonify({
            'success': True,
            'frame_count': len(frame_paths),
            'hashes': hashes,
            'embeddings': embeddings
        })

    except Exception as e:
        logger.error(f'Feature extraction failed: {str(e)}', exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/compare', methods=['POST'])
def compare_features():
    """
    Compare two sets of features (hashes + embeddings) and return similarity.
    
    Input JSON:
        {
            "source": { "hashes": [...], "embeddings": [...] },
            "target": { "hashes": [...], "embeddings": [...] }
        }
    
    Returns JSON:
        {
            "success": true,
            "similarity": 87.5,
            "confidence": "high",
            "matched_frames": 4
        }
    """
    try:
        data = request.get_json()
        source = data.get('source')
        target = data.get('target')

        if not source or not target:
            return jsonify({'error': 'source and target feature sets are required'}), 400

        logger.info('Comparing feature sets...')

        result = compute_similarity(source, target)

        logger.info(f'Similarity: {result["similarity"]:.1f}%, '
                     f'Confidence: {result["confidence"]}, '
                     f'Matched frames: {result["matched_frames"]}')

        return jsonify({
            'success': True,
            **result
        })

    except Exception as e:
        logger.error(f'Comparison failed: {str(e)}', exc_info=True)
        return jsonify({'error': str(e), 'success': False}), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_SERVICE_PORT', 5001))
    logger.info(f'Starting ML Service on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)
