import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Cpu,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { VideoInspection, SampleVideoPreset } from '../types/optimizer.js';

interface VideoOptimizerProps {
  onStartJob: (filePath: string) => void;
  isProcessing: boolean;
  selectedInspection: VideoInspection | null;
  onInspectionChange: (inspection: VideoInspection | null, filePath: string | null) => void;
}

export const VideoOptimizer: React.FC<VideoOptimizerProps> = ({
  onStartJob,
  isProcessing,
  selectedInspection,
  onInspectionChange,
}) => {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [samplePresets, setSamplePresets] = useState<SampleVideoPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgressText, setUploadProgressText] = useState<string>('Inspecting Video Streams...');

  // Load sample presets from backend
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch samples');
        return res.json();
      })
      .then((data) => {
        if (data.presets) {
          setSamplePresets(data.presets);
        }
      })
      .catch((err) => console.error('Failed to load sample presets:', err));
  }, []);

  // Reliable XHR uploader that bypasses iframe monkeypatched fetch wrappers
  const uploadFormDataXHR = (url: string, formData: FormData, onProgress?: (percent: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Accept', 'application/json');

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        const status = xhr.status;
        const text = xhr.responseText || '';
        if (status >= 200 && status < 300) {
          try {
            const json = JSON.parse(text);
            resolve(json);
          } catch (_) {
            reject(new Error(`Server response error (${status})`));
          }
        } else {
          let errorMsg = `Upload failed with status ${status}`;
          try {
            const errJson = JSON.parse(text);
            errorMsg = errJson.error || errorMsg;
          } catch (_) {
            if (text.includes('413') || text.includes('Too Large')) {
              errorMsg = 'File chunk exceeded server limit.';
            } else if (text.startsWith('<!doctype') || text.startsWith('<html')) {
              errorMsg = 'Upload proxy encountered an error. Please retry.';
            }
          }
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network connection error during upload. Please retry.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out. Please retry.'));
      };

      xhr.timeout = 120000;
      xhr.send(formData);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      setUploadError('File exceeds 1 GB maximum limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSelectedPresetId(null);
    setUploadProgressText('Preparing upload...');

    try {
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk for ultra-reliable upload in sandboxed iframes
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      let finalResult: any = null;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunkBlob = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunkBlob, `part_${i}`);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', String(i));
        formData.append('totalChunks', String(totalChunks));
        formData.append('filename', file.name);

        const data = await uploadFormDataXHR('/api/upload/chunk', formData, (partPercent) => {
          if (totalChunks > 1) {
            const overall = Math.round(((i + partPercent / 100) / totalChunks) * 100);
            setUploadProgressText(`Uploading: ${overall}% (Part ${i + 1}/${totalChunks})...`);
          } else {
            setUploadProgressText(`Uploading: ${partPercent}%...`);
          }
        });

        if (data.inspection) {
          finalResult = data;
        }
      }

      if (!finalResult) {
        throw new Error('Video stream inspection failed on server.');
      }

      setCurrentFilePath(finalResult.filePath);
      onInspectionChange(finalResult.inspection, finalResult.filePath);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Video inspection failed');
    } finally {
      setIsUploading(false);
      setUploadProgressText('Inspecting Video Streams...');
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    setIsUploading(true);
    setUploadError(null);
    setSelectedPresetId(presetId);
    setUploadProgressText('Loading preset streams...');

    try {
      const res = await fetch('/api/samples/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = 'Failed to load sample preset';
        try {
          const parsed = JSON.parse(text);
          msg = parsed.error || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await res.json();
      setCurrentFilePath(data.filePath);
      onInspectionChange(data.inspection, data.filePath);
    } catch (err: any) {
      console.error('Preset select failed:', err);
      setUploadError(err.message || 'Sample inspection failed');
    } finally {
      setIsUploading(false);
      setUploadProgressText('Inspecting Video Streams...');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleOptimizeClick = () => {
    if (currentFilePath && !isProcessing) {
      onStartJob(currentFilePath);
    }
  };

  return (
    <section id="optimizer" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#00FF66]/20 pb-5">
        <div>
          <div className="text-xs font-mono text-[#00FF66] tracking-widest uppercase mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] inline-block shadow-[0_0_8px_#00FF66]" />
            SECTION 01 · PRIMARY ENGINE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Video Optimizer
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Automatic video inspection with genuine Haze-style MP4 container restructuring.
            Preserves 100% original encoded video &amp; audio streams.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-[#0c140e] px-3 py-1.5 rounded-lg border border-[#00FF66]/20 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
          <span>Lossless Container Pass-through</span>
        </div>
      </div>

      {/* Main Grid: Upload & Presets (Left) + Auto Inspection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Zone & 1-Click Test Clips */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl p-7 text-center transition-all border-2 border-dashed ${
              dragActive
                ? 'border-[#00FF66] bg-[#00FF66]/10 shadow-[0_0_30px_rgba(0,255,102,0.3)]'
                : 'border-[#00FF66]/30 bg-[#080d09] hover:border-[#00FF66]/60 hover:bg-[#0c160f]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/mov,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-black/60 border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.2)]">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#00FF66]" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div className="text-base font-bold text-white mb-1">
              {isUploading ? uploadProgressText : 'Drop video here or click to browse'}
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Supports MP4, MOV, high-bitrate masters (Max 1 GB)
            </p>

            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#00FF66] bg-[#0c1c11] px-2.5 py-1 rounded-md border border-[#00FF66]/30">
              <span>Automatic Inspection · No Quality Reduction</span>
            </div>
          </div>

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* 1-Click Instant Test Clip Presets */}
          <div className="p-4 rounded-xl bg-[#090e0a] border border-[#00FF66]/20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#00FF66]" />
                1-Click Verified Test Clips
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Instant Test Mode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  disabled={isUploading || isProcessing}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    selectedPresetId === preset.id
                      ? 'border-[#00FF66] bg-[#00FF66]/15 shadow-[0_0_15px_rgba(0,255,102,0.25)] text-white'
                      : 'border-neutral-800 bg-[#0d140f] hover:border-[#00FF66]/40 text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold truncate">{preset.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-[#00FF66] border border-[#00FF66]/30">
                      {preset.container}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {preset.resolution} · {preset.fps} FPS · {preset.codec.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 13 Automatically Detected Specifications */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#090e0b] border border-[#00FF66]/25 p-5 sm:p-6 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#00FF66]" />
                <h3 className="text-base font-bold text-white">
                  Automatic Video Stream Inspection
                </h3>
              </div>

              {selectedInspection ? (
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#00FF66]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Streams Verified</span>
                </div>
              ) : (
                <div className="text-xs font-mono text-neutral-400">
                  Awaiting video input
                </div>
              )}
            </div>

            {selectedInspection ? (
              <div className="space-y-5">
                {/* File Overview Banner */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-[#00FF66]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-[#00FF66]" />
                    <span className="text-white font-bold truncate max-w-[240px] sm:max-w-xs">
                      {selectedInspection.filename}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <span>{(selectedInspection.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>·</span>
                    <span>{selectedInspection.duration.toFixed(2)}s</span>
                    <span>·</span>
                    <span className="text-[#00FF66] uppercase">{selectedInspection.formatName}</span>
                  </div>
                </div>

                {/* 13 Key Detected Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* 1. Resolution */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">1. Resolution</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.video?.resolution || 'Unavailable'}
                    </div>
                  </div>

                  {/* 2. Width x Height */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">2. Dimensions</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.video ? `${selectedInspection.video.width} × ${selectedInspection.video.height}` : 'Unavailable'}
                    </div>
                  </div>

                  {/* 3. Original FPS */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">3. Original FPS</div>
                    <div className="text-sm font-bold text-[#00FF66] font-mono mt-0.5">
                      {selectedInspection.video?.fps || 'N/A'} FPS
                    </div>
                  </div>

                  {/* 4. Video Codec */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">4. Video Codec</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5 uppercase">
                      {selectedInspection.video?.codec || 'Unavailable'} ({selectedInspection.video?.profile || 'Main'})
                    </div>
                  </div>

                  {/* 5. Audio Codec */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">5. Audio Codec</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5 uppercase">
                      {selectedInspection.audio ? `${selectedInspection.audio.codec} (${selectedInspection.audio.channelLayout})` : 'No Audio Track'}
                    </div>
                  </div>

                  {/* 6. Video Bitrate */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">6. Video Bitrate</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.video?.bitrate ? `${(selectedInspection.video.bitrate / 1000).toFixed(0)} kbps` : 'Variable / Pass-through'}
                    </div>
                  </div>

                  {/* 7. Audio Bitrate */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">7. Audio Bitrate</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.audio?.bitrate ? `${(selectedInspection.audio.bitrate / 1000).toFixed(0)} kbps` : selectedInspection.audio ? 'Standard' : 'N/A'}
                    </div>
                  </div>

                  {/* 8. Duration */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">8. Duration</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.duration.toFixed(2)} seconds
                    </div>
                  </div>

                  {/* 9. Aspect Ratio */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">9. Aspect Ratio</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.video?.aspectRatio || '16:9'}
                    </div>
                  </div>

                  {/* 10. Pixel Format */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">10. Pixel Format</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.video?.pixelFormat || 'yuv420p'} ({selectedInspection.video?.bitDepth || 8}-bit)
                    </div>
                  </div>

                  {/* 11. Color Space */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">11. Color Space</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {selectedInspection.video?.colorSpace || 'bt709'}
                    </div>
                  </div>

                  {/* 12. HDR Information */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">12. HDR Info</div>
                    <div className={`text-sm font-bold font-mono mt-0.5 ${selectedInspection.video?.isHdr ? 'text-amber-400' : 'text-neutral-300'}`}>
                      {selectedInspection.video?.isHdr ? 'HDR (10-bit Wide Gamut)' : 'SDR (Standard Dynamic Range)'}
                    </div>
                  </div>

                  {/* 13. Streams Detected */}
                  <div className="p-3 rounded-lg bg-[#0d1410] border border-neutral-800 col-span-2 sm:col-span-3">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">13. Encoded Streams</div>
                    <div className="text-xs sm:text-sm font-bold text-[#00FF66] font-mono mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>{selectedInspection.streamsCount} Stream(s) Tracked (Video + Audio)</span>
                      <span className="text-[11px] sm:text-xs text-neutral-400 font-normal">
                        Moov Atom: {selectedInspection.moovPosition === 'front' ? 'FRONT (Optimized)' : 'BACK (Requires Faststart Relocation)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Container Structure & Moov Atom Status */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-[#00FF66]/20">
                  <div className="text-xs font-mono text-neutral-400 mb-2 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#00FF66]" />
                    <span>MP4 Container Box Structure:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {selectedInspection.mp4Boxes.map((box, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded border text-[11px] ${
                          box.type === 'moov'
                            ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66] font-bold shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                            : box.type === 'mdat'
                            ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
                            : 'bg-black/50 border-neutral-800 text-neutral-400'
                        }`}
                        title={box.description}
                      >
                        {box.type.toUpperCase()} ({(box.size / 1024).toFixed(1)} KB)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleOptimizeClick}
                    disabled={isProcessing}
                    className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all ${
                      isProcessing
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700'
                        : 'bg-[#00FF66] hover:bg-[#1aff7b] text-black shadow-[0_0_35px_rgba(0,255,102,0.6)] hover:shadow-[0_0_50px_rgba(0,255,102,0.9)] cursor-pointer'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {isProcessing ? 'FAHAD METHOD ENGINE RUNNING...' : 'OPTIMIZE CONTAINER (FAHAD METHOD)'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-[11px] font-mono text-neutral-400 mt-2">
                    Zero re-encoding guarantee · Raw bitstream pass-through · Verified MD5 hashing
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-neutral-400">
                <FileVideo className="w-12 h-12 mx-auto text-neutral-700 mb-3" />
                <div className="text-sm font-medium text-neutral-300">No video selected yet</div>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Drop an MP4/MOV video or pick one of the verified 1-click test clips to automatically inspect all video and audio streams.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
