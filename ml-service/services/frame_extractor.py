"""
Frame Extractor Service
Downloads videos and extracts uniformly-sampled frames using FFmpeg.
"""

import os
import subprocess
import uuid
import logging
import json
import shutil

logger = logging.getLogger('ml-service.frame_extractor')


def extract_frames_from_url(video_url, temp_dir, num_frames=6, is_youtube=False):
    """
    Download a video from URL and extract frames.
    
    Args:
        video_url: URL of the video (Cloudinary or YouTube)
        temp_dir: Directory for temporary files
        num_frames: Number of frames to extract (default 6)
        is_youtube: If True, use yt-dlp to download
    
    Returns:
        List of absolute paths to extracted frame images
    """
    job_id = str(uuid.uuid4())[:8]
    job_dir = os.path.join(temp_dir, f'job_{job_id}')
    os.makedirs(job_dir, exist_ok=True)

    try:
        # Step 1: Download the video
        video_path = _download_video(video_url, job_dir, is_youtube)
        
        if not video_path or not os.path.exists(video_path):
            raise ValueError(f'Failed to download video from {video_url}')

        # Step 2: Get video duration
        duration = _get_video_duration(video_path)
        logger.info(f'Video duration: {duration:.2f}s')

        # Step 3: Extract frames at uniform intervals
        frame_paths = _extract_frames(video_path, job_dir, num_frames, duration)

        # Step 4: Clean up downloaded video (keep frames)
        try:
            os.remove(video_path)
        except OSError:
            pass

        return frame_paths

    except Exception as e:
        # Cleanup on failure
        shutil.rmtree(job_dir, ignore_errors=True)
        raise e


def _download_video(url, output_dir, is_youtube=False):
    """
    Download video from URL.
    Uses yt-dlp for YouTube, wget/requests for direct URLs.
    """
    output_path = os.path.join(output_dir, 'video.mp4')

    if is_youtube:
        return _download_youtube(url, output_path)
    else:
        return _download_direct(url, output_path)


def _download_youtube(url, output_path):
    """Download YouTube video using yt-dlp."""
    try:
        cmd = [
            'yt-dlp',
            '--format', 'best[height<=720][ext=mp4]/best[height<=720]/best',
            '--output', output_path,
            '--no-playlist',
            '--quiet',
            url
        ]
        
        logger.info(f'Downloading YouTube video: {url}')
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=120
        )

        if result.returncode != 0:
            logger.error(f'yt-dlp error: {result.stderr}')
            # Fallback: try to download just the thumbnail
            return _download_youtube_thumbnail(url, output_path)

        return output_path

    except FileNotFoundError:
        logger.warning('yt-dlp not found, falling back to thumbnail extraction')
        return _download_youtube_thumbnail(url, output_path)
    except subprocess.TimeoutExpired:
        logger.error('yt-dlp download timed out')
        return _download_youtube_thumbnail(url, output_path)


def _download_youtube_thumbnail(url, output_path):
    """
    Fallback: Download YouTube thumbnail as a single frame when yt-dlp fails.
    Extracts video ID and fetches maxresdefault thumbnail.
    """
    import requests

    video_id = None
    if 'youtube.com/watch?v=' in url:
        video_id = url.split('v=')[1].split('&')[0]
    elif 'youtu.be/' in url:
        video_id = url.split('youtu.be/')[1].split('?')[0]

    if not video_id:
        raise ValueError(f'Cannot extract video ID from: {url}')

    # Try different thumbnail resolutions
    thumb_urls = [
        f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg',
        f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg',
        f'https://img.youtube.com/vi/{video_id}/mqdefault.jpg',
    ]

    thumb_path = output_path.replace('.mp4', '_thumb.jpg')

    for thumb_url in thumb_urls:
        try:
            resp = requests.get(thumb_url, timeout=10)
            if resp.status_code == 200 and len(resp.content) > 1000:
                with open(thumb_path, 'wb') as f:
                    f.write(resp.content)
                logger.info(f'Downloaded YouTube thumbnail: {thumb_url}')
                return thumb_path
        except Exception:
            continue

    raise ValueError(f'Failed to download thumbnail for video: {video_id}')


def _download_direct(url, output_path):
    """Download video from a direct URL (e.g., Cloudinary)."""
    import requests

    logger.info(f'Downloading video: {url}')
    
    try:
        resp = requests.get(url, stream=True, timeout=60)
        resp.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        file_size = os.path.getsize(output_path)
        logger.info(f'Downloaded {file_size / (1024*1024):.1f} MB')
        return output_path

    except Exception as e:
        logger.error(f'Direct download failed: {str(e)}')
        raise


def _get_video_duration(video_path):
    """Get video duration in seconds using ffprobe."""
    # If it's a thumbnail image (not a video), return 0
    if video_path.endswith(('.jpg', '.jpeg', '.png')):
        return 0

    try:
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            video_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode != 0:
            logger.warning(f'ffprobe failed: {result.stderr}')
            return 10.0  # Default fallback

        metadata = json.loads(result.stdout)
        duration = float(metadata.get('format', {}).get('duration', 10.0))
        return duration

    except (FileNotFoundError, json.JSONDecodeError, subprocess.TimeoutExpired) as e:
        logger.warning(f'Could not get video duration: {str(e)}, using default')
        return 10.0


def _extract_frames(video_path, output_dir, num_frames, duration):
    """
    Extract uniformly-sampled frames from a video using FFmpeg.
    
    For images (thumbnails), just return the image path directly.
    """
    # If it's already an image (YouTube thumbnail fallback), return it directly
    if video_path.endswith(('.jpg', '.jpeg', '.png')):
        logger.info('Input is an image, skipping FFmpeg frame extraction')
        return [video_path]

    frame_paths = []
    
    try:
        if duration <= 0:
            # If duration unknown, extract first frame
            frame_path = os.path.join(output_dir, 'frame_0001.jpg')
            cmd = [
                'ffmpeg', '-i', video_path,
                '-vframes', '1',
                '-q:v', '2',
                frame_path,
                '-y', '-loglevel', 'error'
            ]
            subprocess.run(cmd, capture_output=True, timeout=30)
            if os.path.exists(frame_path):
                frame_paths.append(frame_path)
            return frame_paths

        # Calculate interval between frames
        # Avoid very start and end of the video
        start_offset = duration * 0.05  # Skip first 5%
        end_offset = duration * 0.95    # Skip last 5%
        usable_duration = end_offset - start_offset
        interval = usable_duration / (num_frames - 1) if num_frames > 1 else usable_duration

        for i in range(num_frames):
            timestamp = start_offset + (i * interval)
            frame_path = os.path.join(output_dir, f'frame_{i:04d}.jpg')

            cmd = [
                'ffmpeg',
                '-ss', str(timestamp),
                '-i', video_path,
                '-vframes', '1',
                '-q:v', '2',
                frame_path,
                '-y', '-loglevel', 'error'
            ]

            result = subprocess.run(cmd, capture_output=True, timeout=15)

            if os.path.exists(frame_path) and os.path.getsize(frame_path) > 0:
                frame_paths.append(frame_path)
                logger.debug(f'Extracted frame {i+1}/{num_frames} at {timestamp:.2f}s')
            else:
                logger.warning(f'Failed to extract frame at {timestamp:.2f}s')

        if not frame_paths:
            # Last resort: extract any frame
            frame_path = os.path.join(output_dir, 'frame_fallback.jpg')
            cmd = [
                'ffmpeg', '-i', video_path,
                '-vframes', '1', '-q:v', '2',
                frame_path, '-y', '-loglevel', 'error'
            ]
            subprocess.run(cmd, capture_output=True, timeout=30)
            if os.path.exists(frame_path):
                frame_paths.append(frame_path)

    except FileNotFoundError:
        logger.error('FFmpeg not found. Please install FFmpeg and add it to PATH.')
        raise RuntimeError('FFmpeg is not installed or not found in PATH')
    except subprocess.TimeoutExpired:
        logger.error('FFmpeg frame extraction timed out')

    return frame_paths
