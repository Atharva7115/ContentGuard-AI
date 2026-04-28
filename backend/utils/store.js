/**
 * Detection Store
 * In-memory store for detected results and activity feed.
 */

export const detectionStore = {
  results: [],       // All detection results from /api/detect
  contentList: [],   // Uploaded content metadata
  activities: []     // Activity feed entries
}
