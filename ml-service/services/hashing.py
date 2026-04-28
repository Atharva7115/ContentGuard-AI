"""
Perceptual Hashing Service
Computes pHash for images and calculates Hamming distance similarity.
"""

import logging
from PIL import Image
import imagehash

logger = logging.getLogger('ml-service.hashing')


def compute_phashes(image_paths):
    """
    Compute perceptual hash (pHash) for each image.
    
    Args:
        image_paths: List of absolute paths to images
    
    Returns:
        List of hex string hashes
    """
    hashes = []
    
    for path in image_paths:
        try:
            img = Image.open(path)
            # pHash is robust to scaling, minor color changes, and small modifications
            phash = imagehash.phash(img, hash_size=16)
            hashes.append(str(phash))
            logger.debug(f'pHash for {path}: {phash}')
        except Exception as e:
            logger.warning(f'Failed to hash {path}: {str(e)}')
            hashes.append(None)
    
    return hashes


def compute_hash_similarity(hash1_hex, hash2_hex):
    """
    Compute similarity between two perceptual hashes using Hamming distance.
    
    Args:
        hash1_hex: Hex string of first hash
        hash2_hex: Hex string of second hash
    
    Returns:
        Float similarity score between 0.0 and 1.0
    """
    if hash1_hex is None or hash2_hex is None:
        return 0.0
    
    try:
        h1 = imagehash.hex_to_hash(hash1_hex)
        h2 = imagehash.hex_to_hash(hash2_hex)
        
        # Hamming distance: number of bits that differ
        distance = h1 - h2
        
        # Max possible distance for hash_size=16 is 256 bits
        max_distance = 16 * 16  # hash_size^2
        
        # Convert to similarity (0 = completely different, 1 = identical)
        similarity = 1.0 - (distance / max_distance)
        
        return max(0.0, min(1.0, similarity))
    
    except Exception as e:
        logger.warning(f'Hash comparison failed: {str(e)}')
        return 0.0
