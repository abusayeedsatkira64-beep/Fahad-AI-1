import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import { SampleVideoPreset } from '../src/types/optimizer.js';

const execPromise = util.promisify(exec);

export const SAMPLE_PRESETS: SampleVideoPreset[] = [
  {
    id: '1080p_60fps',
    title: '1080p 60 FPS High Motion',
    description: '1920x1080 @ 60 FPS H.264 stream with rapid color transitions and stereo tone.',
    resolution: '1920x1080',
    fps: 60,
    codec: 'h264',
    duration: '1.5s',
    container: 'MP4',
  },
  {
    id: '1080p_30fps',
    title: '1080p 30 FPS Standard',
    description: '1920x1080 @ 30 FPS standard creator upload format.',
    resolution: '1920x1080',
    fps: 30,
    codec: 'h264',
    duration: '1.5s',
    container: 'MP4',
  },
  {
    id: '4k_60fps',
    title: '4K Ultra HD 60 FPS',
    description: '3840x2160 @ 60 FPS ultra-high resolution test pattern.',
    resolution: '3840x2160',
    fps: 60,
    codec: 'h264',
    duration: '1.0s',
    container: 'MP4',
  },
  {
    id: 'unoptimized_mov',
    title: 'Unoptimized QuickTime MOV',
    description: 'MOV container with moov atom positioned at the end of the file.',
    resolution: '1920x1080',
    fps: 60,
    codec: 'h264',
    duration: '1.5s',
    container: 'MOV',
    isUnoptimizedSample: true,
  },
];

export async function ensureSpecificSamplePresetExists(presetId: string, samplesDir: string): Promise<string> {
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  let filename = `sample_${presetId}.mp4`;
  if (presetId === 'unoptimized_mov') {
    filename = 'sample_unoptimized_mov.mov';
  } else if (presetId === 'tiktok_vertical') {
    filename = 'tiktok_vertical_benchmark.mp4';
  }

  const filePath = path.join(samplesDir, filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return filePath;
  }

  // Generate on demand
  switch (presetId) {
    case '1080p_60fps':
      await execPromise(
        `ffmpeg -v error -f lavfi -i testsrc=duration=1.5:size=1920x1080:rate=60 -f lavfi -i sine=frequency=880:duration=1.5 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac "${filePath}" -y`
      );
      break;

    case '1080p_30fps':
      await execPromise(
        `ffmpeg -v error -f lavfi -i testsrc=duration=1.5:size=1920x1080:rate=30 -f lavfi -i sine=frequency=440:duration=1.5 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac "${filePath}" -y`
      );
      break;

    case '4k_60fps':
      await execPromise(
        `ffmpeg -v error -f lavfi -i testsrc=duration=1.0:size=3840x2160:rate=60 -f lavfi -i sine=frequency=528:duration=1.0 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac "${filePath}" -y`
      );
      break;

    case 'unoptimized_mov':
      await execPromise(
        `ffmpeg -v error -f lavfi -i testsrc=duration=1.5:size=1920x1080:rate=60 -f lavfi -i sine=frequency=660:duration=1.5 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac -f mov "${filePath}" -y`
      );
      break;

    case 'tiktok_vertical':
      await execPromise(
        `ffmpeg -v error -f lavfi -i testsrc=duration=1.5:size=1080x1920:rate=60 -f lavfi -i sine=frequency=440:duration=1.5 -c:v libx264 -preset ultrafast -pix_fmt yuv420p -b:v 4500k -c:a aac -b:a 128k "${filePath}" -y`
      );
      break;

    default:
      throw new Error(`Unknown preset ID: ${presetId}`);
  }

  return filePath;
}

export async function ensureSampleVideosExist(samplesDir: string) {
  // Legacy stub - now on-demand
  return;
}
