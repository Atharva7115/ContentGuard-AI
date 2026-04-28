"""
Similarity Computation Service
Combines CLIP embedding cosine similarity with pHash Hamming distance.
"""

import logging
import numpy as np
from services.hashing import compute_hash_similarity

logger = logging.getLogger('ml-service.similarity')


def _cosine_similarity(vec1, vec2):
    """Cosine similarity between two vectors. Returns 0-1."""
    if vec1 is None or vec2 is None:
        return 0.0
    try:
        a = np.array(vec1, dtype=np.float32)
        b = np.array(vec2, dtype=np.float32)
        a_norm = np.linalg.norm(a)
        b_norm = np.linalg.norm(b)
        if a_norm == 0 or b_norm == 0:
            return 0.0
        cosine = np.dot(a, b) / (a_norm * b_norm)
        return max(0.0, float(cosine))
    except Exception:
        return 0.0


def compute_similarity(source, target):
    """
    Compare source and target feature sets.
    
    Weighted: 70% CLIP cosine + 30% pHash Hamming.
    Final = 60% max_pair + 40% avg_top3.
    Confidence requires >=2 frames above 60% threshold.
    
    Returns: { similarity: 0-100, confidence: str, matched_frames: int }
    """
    src_h = source.get('hashes', [])
    src_e = source.get('embeddings', [])
    tgt_h = target.get('hashes', [])
    tgt_e = target.get('embeddings', [])

    if not src_e or not tgt_e:
        return {'similarity': 0.0, 'confidence': 'none', 'matched_frames': 0}

    scores = []
    high_matches = 0

    for i in range(len(src_e)):
        for j in range(len(tgt_e)):
            emb_sim = _cosine_similarity(src_e[i], tgt_e[j])
            hash_sim = 0.0
            if i < len(src_h) and j < len(tgt_h):
                hash_sim = compute_hash_similarity(src_h[i], tgt_h[j])
            combined = (0.7 * emb_sim) + (0.3 * hash_sim)
            scores.append(combined)
            if combined > 0.60:
                high_matches += 1

    if not scores:
        return {'similarity': 0.0, 'confidence': 'none', 'matched_frames': 0}

    max_sim = max(scores) * 100
    top_k = min(3, len(scores))
    sorted_s = sorted(scores, reverse=True)
    avg_top = (sum(sorted_s[:top_k]) / top_k) * 100
    final = min(100.0, max(0.0, 0.6 * max_sim + 0.4 * avg_top))

    if final >= 80 and high_matches >= 2:
        confidence = 'high'
    elif final >= 60 or high_matches >= 1:
        confidence = 'medium'
    else:
        confidence = 'low'

    return {
        'similarity': round(final, 1),
        'confidence': confidence,
        'matched_frames': high_matches
    }
