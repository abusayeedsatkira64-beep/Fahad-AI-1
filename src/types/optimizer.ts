export interface MP4BoxInfo {
  type: string;
  offset: number;
  size: number;
  description?: string;
  children?: MP4BoxInfo[];
}

export interface VideoStreamDetails {
  codec: string;
  codecLongName: string;
  profile: string;
  width: number;
  height: number;
  resolution: string;
  fps: number;
  avgFps: number;
  aspectRatio: string;
  bitrate: number;
  pixelFormat: string;
  colorSpace: string;
  colorPrimaries: string;
  colorTransfer: string;
  isHdr: boolean;
  bitDepth: number;
  frameCount: number;
}

export interface AudioStreamDetails {
  codec: string;
  codecLongName: string;
  channels: number;
  channelLayout: string;
  sampleRate: number;
  bitrate: number;
}

export interface VideoInspection {
  filename: string;
  fileSize: number;
  duration: number;
  formatName: string;
  containerBrand: string;
  bitrate: number;
  video: VideoStreamDetails | null;
  audio: AudioStreamDetails | null;
  streamsCount: number;
  mp4Boxes: MP4BoxInfo[];
  moovPosition: 'front' | 'back' | 'unknown';
  bitstreamHash?: string;
}

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  stageNumber: number;
  stageCode: string;
  message: string;
  status: 'info' | 'running' | 'success' | 'warning' | 'error';
  elapsedMs: number;
  details?: Record<string, any>;
}

export interface VerificationResult {
  status: 'Original Encoded Streams Preserved' | 'Container Optimization Successful' | 'Re-encoding Required' | 'Output Validation Failed';
  isStreamsPreserved: boolean;
  isVideoCodecMatched: boolean;
  isAudioCodecMatched: boolean;
  isResolutionMatched: boolean;
  isFpsMatched: boolean;
  isBitstreamHashMatched: boolean;
  originalHash: string;
  optimizedHash: string;
  originalSize: number;
  optimizedSize: number;
  sizeDelta: number;
  moovRelocatedToFront: boolean;
  notes: string[];
}

export interface OptimizationJob {
  jobId: string;
  createdAt: string;
  stage: number;
  totalStages: number;
  status: 'idle' | 'inspecting' | 'optimizing' | 'verifying' | 'completed' | 'failed';
  originalSpecs: VideoInspection | null;
  optimizedSpecs: VideoInspection | null;
  verification: VerificationResult | null;
  logs: TerminalLogEntry[];
  downloadUrl?: string;
  error?: string;
  elapsedTotalMs?: number;
}

export interface TikTokAnalysisResult {
  url: string;
  status: 'success' | 'error';
  deliveredResolution: string;
  width: number;
  height: number;
  fps: number;
  avgFps: number;
  videoCodec: string;
  audioCodec: string;
  videoBitrate: number;
  audioBitrate: number;
  fileSize: number;
  duration: number;
  aspectRatio: string;
  pixelFormat: string;
  colorSpace: string;
  isHdr: boolean;
  metrics: {
    views?: string | number;
    likes?: string | number;
    comments?: string | number;
    shares?: string | number;
    author?: string;
    description?: string;
  };
  sourceVsDeliveredNotes: string[];
  rawProbeAvailable: boolean;
  error?: string;
}

export interface SampleVideoPreset {
  id: string;
  title: string;
  description: string;
  resolution: string;
  fps: number;
  codec: string;
  duration: string;
  container: string;
  isUnoptimizedSample?: boolean;
}
