/**
 * Similarity Service - DEPRECATED
 * All similarity computation is now handled by the Python ML service.
 * This file is kept for reference only.
 */

// All similarity computation has been moved to:
// ml-service/services/similarity.py
// ml-service/services/hashing.py
// ml-service/services/embedding.py

export const calculateSimilarity = async () => {
  throw new Error('Similarity computation has moved to the Python ML service')
}

export const generateDNA = async () => {
  throw new Error('DNA generation has moved to the Python ML service')
}
