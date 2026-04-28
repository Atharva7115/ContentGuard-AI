/**
 * Detect Controller
 * Orchestrates the full similarity detection pipeline:
 * 1. Extract features from source video (external ML service)
 * 2. Generate keywords (Gemini API)
 * 3. Search YouTube for candidate videos
 * 4. Extract features from each candidate (external ML service)
 * 5. Compare source vs each candidate (external ML service)
 * 6. Return ranked results
 */

import { extractFeatures, compareFeatures } from '../services/pythonService.js'
import { extractKeywordsWithGemini } from '../services/geminiService.js'
import { searchVideos } from '../services/youtubeService.js'
import { detectionStore } from '../utils/store.js'

/**
 * POST /api/detect
 * Input: { videoUrl: string, fileName?: string, contentId?: number }
 * Output: { success: true, results: [...] }
 */
export const runDetectionPipeline = async (req, res) => {
  try {
    const { videoUrl, fileName, contentId } = req.body

    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' })
    }

    console.log('\n' + '='.repeat(60))
    console.log('🔍 STARTING DETECTION PIPELINE')
    console.log(`   Video: ${videoUrl}`)
    console.log('='.repeat(60))

    // ─── Step 1: Extract features from source video ─────────────
    console.log('\n📊 Step 1/5: Extracting features from source video...')
    let sourceFeatures
    try {
      sourceFeatures = await extractFeatures(videoUrl, false)
      console.log(`   ✅ Extracted ${sourceFeatures.frame_count} frames`)
    } catch (error) {
      console.error('❌ Feature extraction failed:', error.message)
      return res.status(502).json({
        error: 'ML service unavailable',
        message: error.message,
      })
    }

    // ─── Step 2: Generate keywords using Gemini ─────────────────
    console.log('\n🤖 Step 2/5: Generating search keywords...')
    const context = fileName || videoUrl.split('/').pop() || 'video content'
    const keywords = await extractKeywordsWithGemini(context)
    console.log(`   ✅ Keywords: ${keywords.join(', ')}`)

    // ─── Step 3: Search YouTube for candidates ──────────────────
    console.log('\n📺 Step 3/5: Searching YouTube...')
    const youtubeResults = await searchVideos(keywords, 5)
    console.log(`   ✅ Found ${youtubeResults.length} candidate videos`)

    if (youtubeResults.length === 0) {
      return res.json({
        success: true,
        results: [],
        keywords,
        message: 'No YouTube videos found for comparison',
      })
    }

    // ─── Step 4 & 5: Extract + compare each YouTube candidate ───
    console.log('\n🔬 Step 4/5: Comparing YouTube candidates...')
    const results = []

    for (let i = 0; i < youtubeResults.length; i++) {
      const candidate = youtubeResults[i]
      const ytUrl = `https://www.youtube.com/watch?v=${candidate.videoId}`

      try {
        console.log(`   [${i + 1}/${youtubeResults.length}] Processing: ${candidate.title}`)

        const targetFeatures = await extractFeatures(ytUrl, true)
        const comparison = await compareFeatures(sourceFeatures, targetFeatures)

        const status =
          comparison.similarity >= 80 ? 'high' :
          comparison.similarity >= 60 ? 'medium' : 'low'

        results.push({
          id: Date.now() + i,
          videoId: candidate.videoId,
          title: candidate.title,
          channel: candidate.channel,
          thumbnail: candidate.thumbnail,
          url: ytUrl,
          similarity: comparison.similarity,
          confidence: comparison.confidence,
          matched_frames: comparison.matched_frames,
          status,
          timestamp: new Date().toISOString(),
          contentId: contentId || null,
        })

        console.log(`   ✅ Similarity: ${comparison.similarity}% (${status})`)
      } catch (error) {
        console.error(`   ⚠️ Skipping "${candidate.title}": ${error.message}`)
      }
    }

    // Sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity)

    // ─── Store results for dashboard ────────────────────────────
    detectionStore.results.push(...results)

    if (contentId) {
      const content = detectionStore.contentList.find(c => c.id === contentId)
      if (content) content.matches = results.length
    }

    results.forEach(r => {
      detectionStore.activities.unshift({
        id: Date.now() + Math.random(),
        title: `Match detected: ${r.title}`,
        similarity: r.similarity,
        time: 'Just now',
        status: r.status,
      })
    })

    detectionStore.activities = detectionStore.activities.slice(0, 50)

    console.log('\n' + '='.repeat(60))
    console.log(`✅ PIPELINE COMPLETE: ${results.length} matches found`)
    console.log('='.repeat(60) + '\n')

    res.json({
      success: true,
      results,
      keywords,
      totalCompared: youtubeResults.length,
      message: `Found ${results.length} matches`,
    })

  } catch (error) {
    console.error('❌ Detection pipeline error:', error.message)
    res.status(500).json({
      error: 'Detection failed',
      message: error.message,
    })
  }
}
