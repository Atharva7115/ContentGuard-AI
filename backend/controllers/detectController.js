/**
 * Detect Controller
 * Orchestrates the full similarity detection pipeline:
 *   1. Extract features from source video  (ML /extract)
 *   2. Generate search keywords            (Gemini)
 *   3. Search YouTube for candidates       (YouTube API)
 *   4. Extract features from each candidate (ML /extract)
 *   5. Compare source vs each candidate    (ML /compare)
 *   6. Store + return ranked results
 */

import { extractFeatures, compareFeatures } from '../services/pythonService.js'
import { extractKeywordsWithGemini } from '../services/geminiService.js'
import { searchVideos } from '../services/youtubeService.js'
import { detectionStore } from '../utils/store.js'

/**
 * POST /api/detect
 * Body:    { videoUrl: string, fileName?: string, contentId?: number }
 * Returns: { success: true, results: [...], keywords: [...], totalCompared: number }
 */
export const runDetectionPipeline = async (req, res) => {
  const { videoUrl, fileName, contentId } = req.body

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' })
  }

  console.log('\n' + '='.repeat(60))
  console.log('🔍 DETECTION PIPELINE START')
  console.log(`   Video: ${videoUrl}`)
  console.log('='.repeat(60))

  // ── Step 1: Extract source features ───────────────────────────
  console.log('\n📊 [1/5] Extracting source features...')
  let sourceFeatures
  try {
    sourceFeatures = await extractFeatures(videoUrl, false)
  } catch (err) {
    console.error('❌ Source extraction failed:', err.message)
    return res.status(502).json({
      error:   'ML service unavailable',
      message: err.message,
    })
  }

  // ── Step 2: Generate keywords ──────────────────────────────────
  console.log('\n🤖 [2/5] Generating keywords...')
  const context  = fileName || videoUrl.split('/').pop() || 'video'
  const keywords = await extractKeywordsWithGemini(context)
  console.log(`   Keywords: ${keywords.join(', ')}`)

  // ── Step 3: Search YouTube ─────────────────────────────────────
  console.log('\n📺 [3/5] Searching YouTube...')
  const candidates = await searchVideos(keywords, 5)
  console.log(`   Found ${candidates.length} candidates`)

  if (candidates.length === 0) {
    return res.json({
      success:        true,
      results:        [],
      keywords,
      totalCompared:  0,
      message:        'No YouTube videos found for comparison',
    })
  }

  // ── Steps 4 & 5: Extract + compare each candidate ─────────────
  console.log('\n🔬 [4/5] Comparing candidates...')
  const results = []

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    const ytUrl     = `https://www.youtube.com/watch?v=${candidate.videoId}`

    try {
      console.log(`   [${i + 1}/${candidates.length}] ${candidate.title}`)

      const targetFeatures = await extractFeatures(ytUrl, true)
      const comparison     = await compareFeatures(sourceFeatures, targetFeatures)

      const status =
        comparison.similarity >= 80 ? 'high'   :
        comparison.similarity >= 60 ? 'medium' : 'low'

      results.push({
        id:             Date.now() + i,
        videoId:        candidate.videoId,
        title:          candidate.title,
        channel:        candidate.channel,
        thumbnail:      candidate.thumbnail,
        url:            ytUrl,
        similarity:     comparison.similarity,
        confidence:     comparison.confidence,
        matched_frames: comparison.matched_frames,
        status,
        timestamp:      new Date().toISOString(),
        contentId:      contentId || null,
      })

      console.log(`   ✅ ${comparison.similarity}% similarity (${status})`)
    } catch (err) {
      // Skip this candidate — don't let one failure abort the whole pipeline
      console.error(`   ⚠️  Skipped "${candidate.title}": ${err.message}`)
    }
  }

  // ── Sort + store ───────────────────────────────────────────────
  results.sort((a, b) => b.similarity - a.similarity)

  detectionStore.results.push(...results)

  if (contentId) {
    const content = detectionStore.contentList.find(c => c.id === contentId)
    if (content) content.matches = (content.matches || 0) + results.length
  }

  results.forEach(r => {
    detectionStore.activities.unshift({
      id:         Date.now() + Math.random(),
      title:      `Match detected: ${r.title}`,
      similarity: r.similarity,
      time:       'Just now',
      status:     r.status,
    })
  })
  detectionStore.activities = detectionStore.activities.slice(0, 50)

  console.log('\n' + '='.repeat(60))
  console.log(`✅ PIPELINE COMPLETE — ${results.length} matches found`)
  console.log('='.repeat(60) + '\n')

  return res.json({
    success:       true,
    results,
    keywords,
    totalCompared: candidates.length,
    message:       `Found ${results.length} matches`,
  })
}
