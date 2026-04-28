/**
 * Video Service - DEPRECATED
 * Frame extraction is now handled by the Python ML service.
 * This file is kept for reference only.
 */

// All frame extraction and video processing has been moved to:
// ml-service/services/frame_extractor.py
// ml-service/services/embedding.py

export const extractVideoFrames = async () => {
  throw new Error('Video processing has moved to the Python ML service')
}
