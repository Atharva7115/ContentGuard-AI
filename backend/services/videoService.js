import sharp from 'sharp'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execPromise = promisify(exec)

// Extract frames from video at regular intervals
export const extractVideoFrames = async (videoPath, frameCount = 10) => {
  try {
    // In production, use ffmpeg to extract frames
    // For now, return mock frame data
    
    console.log(`Extracting ${frameCount} frames from ${videoPath}`)
    
    const frames = []
    for (let i = 0; i < frameCount; i++) {
      frames.push({
        index: i,
        timestamp: i * 1000, // milliseconds
        path: `frame_${i}.jpg`,
        width: 1920,
        height: 1080
      })
    }
    
    return frames
  } catch (error) {
    console.error('Frame extraction error:', error)
    throw new Error('Failed to extract video frames')
  }
}

// Extract frames using ffmpeg (production implementation)
export const extractFramesWithFFmpeg = async (videoPath, outputDir, frameCount = 10) => {
  try {
    // Calculate frame extraction rate
    const command = `ffmpeg -i ${videoPath} -vf "select='not(mod(n\\,${frameCount}))'" -vsync vfr ${outputDir}/frame_%04d.jpg`
    
    await execPromise(command)
    
    return {
      success: true,
      outputDir,
      message: 'Frames extracted successfully'
    }
  } catch (error) {
    console.error('FFmpeg extraction error:', error)
    throw new Error('Failed to extract frames with FFmpeg')
  }
}

// Get video metadata
export const getVideoMetadata = async (videoPath) => {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams ${videoPath}`
    
    const { stdout } = await execPromise(command)
    const metadata = JSON.parse(stdout)
    
    return {
      duration: metadata.format.duration,
      size: metadata.format.size,
      bitrate: metadata.format.bit_rate,
      videoStream: metadata.streams.find(s => s.codec_type === 'video'),
      audioStream: metadata.streams.find(s => s.codec_type === 'audio')
    }
  } catch (error) {
    console.error('Metadata extraction error:', error)
    throw new Error('Failed to extract video metadata')
  }
}

// Process image with sharp
export const processImage = async (imagePath, options = {}) => {
  try {
    const image = sharp(imagePath)
    
    if (options.resize) {
      image.resize(options.resize.width, options.resize.height)
    }
    
    if (options.format) {
      image.toFormat(options.format)
    }
    
    const buffer = await image.toBuffer()
    return buffer
  } catch (error) {
    console.error('Image processing error:', error)
    throw new Error('Failed to process image')
  }
}
