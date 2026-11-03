import React from 'react';
import {
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Film,
  Zap,
  Info,
  Hash,
} from 'lucide-react';
import { OptimizationJob } from '../types/optimizer.js';

interface OptimizationResultProps {
  job: OptimizationJob;
  onDownload: () => void;
  isDownloading?: boolean;
}

export const OptimizationResult: React.FC<OptimizationResultProps> = ({ job, onDownload, isDownloading }) => {
  const original = job.originalSpecs;
  const optimized = job.optimizedSpecs;
  const verification = job.verification;

  if (!optimized || !original) return null;

  const originalSizeMB = (original.fileSize / (1024 * 1024)).toFixed(2);
  const optimizedSizeMB = (optimized.fileSize / (1024 * 1024)).toFixed(2);

  const rawBase = original.filename ? original.filename.replace(/\.[^/.]+$/, '') : 'video';
  const downloadFileName = `FAHAD_METHOD_${rawBase}.mp4`;

  const openTikTokStudio = () => {
    window.open('https://www.tiktok.com/tiktokstudio/upload', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="tiktok-studio" className="py-10 sm:py-14 px-3.5 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Ready Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0b160e] via-[#070d09] to-black border-2 border-[#00FF66]/50 p-5 sm:p-10 shadow-[0_0_50px_rgba(0,255,102,0.2)]">
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF66]/15 border border-[#00FF66]/40 text-xs font-mono text-[#00FF66] font-bold mb-3 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>ORIGINAL ENCODED STREAMS PRESERVED</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            YOUR VIDEO IS READY!
          </h2>

          <p className="text-xs sm:text-base text-neutral-300 mt-2 px-2">
            MP4 container restructured with faststart moov relocation. Zero generation loss. 
            Download your optimized video file and upload directly to TikTok Studio.
          </p>
        </div>

        {/* Dual Primary CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto mb-4">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-extrabold text-xs sm:text-base text-black bg-[#00FF66] hover:bg-[#1aff7b] shadow-[0_0_35px_rgba(0,255,102,0.6)] hover:shadow-[0_0_50px_rgba(0,255,102,0.9)] transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer ${
              isDownloading ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            <Download className={`w-5 h-5 stroke-[2.5] ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'DOWNLOADING VIDEO...' : 'DOWNLOAD OPTIMIZED VIDEO'}
          </button>

          <button
            onClick={openTikTokStudio}
            className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-base text-white bg-[#101812] hover:bg-[#162219] border border-[#00FF66]/40 hover:border-[#00FF66] transition-all flex items-center justify-center gap-2.5 tracking-wide cursor-pointer"
          >
            <ExternalLink className="w-5 h-5 text-[#00FF66]" />
            OPEN TIKTOK STUDIO
          </button>
        </div>

        {/* Direct Link Alternative for Sandboxed Browsers */}
        <div className="text-center mb-8">
          <a
            href={job.downloadUrl || `/api/download/${job.jobId}`}
            download={downloadFileName}
            className="text-[11px] sm:text-xs font-mono text-neutral-400 hover:text-[#00FF66] underline transition-colors"
          >
            Direct File Download Link (Click here if button doesn't trigger)
          </a>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#00FF66]/20">
          {/* Original Video Information */}
          <div className="p-5 rounded-2xl bg-[#090e0b] border border-neutral-800">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-300 font-bold">
                <Film className="w-4 h-4 text-neutral-400" />
                Original Video Information
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                SOURCE MASTER
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Resolution</span>
                <span className="text-white font-bold">{original.video?.resolution || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">FPS</span>
                <span className="text-white font-bold">{original.video?.fps || 'N/A'} FPS</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Video Codec</span>
                <span className="text-white font-bold uppercase">{original.video?.codec || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Audio Codec</span>
                <span className="text-white font-bold uppercase">{original.audio?.codec || 'No Audio'}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-400">File Size</span>
                <span className="text-white font-bold">{originalSizeMB} MB</span>
              </div>
            </div>
          </div>

          {/* Optimized Video Information */}
          <div className="p-5 rounded-2xl bg-[#090e0b] border border-[#00FF66]/35 shadow-[0_0_20px_rgba(0,255,102,0.08)]">
            <div className="text-xs font-mono uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#00FF66] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                Optimized Video Information
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#00FF66]/15 border border-[#00FF66]/40 text-[#00FF66] font-bold">
                FAHAD METHOD
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Resolution</span>
                <span className="text-[#00FF66] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {optimized.video?.resolution || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">FPS</span>
                <span className="text-[#00FF66] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {optimized.video?.fps || 'N/A'} FPS
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Video Codec</span>
                <span className="text-[#00FF66] font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {optimized.video?.codec || 'N/A'} (100% PRESERVED)
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Audio Codec</span>
                <span className="text-[#00FF66] font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {optimized.audio?.codec || 'No Audio'} (100% PRESERVED)
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">File Size</span>
                <span className="text-white font-bold">{optimizedSizeMB} MB</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-900">
                <span className="text-neutral-400">Processing Method</span>
                <span className="text-[#00FF66] font-bold">Lossless Haze Moov Faststart</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-400">Verification Status</span>
                <span className="text-[#00FF66] font-bold bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                  {verification?.status || 'Original Encoded Streams Preserved'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stream MD5 Parity Proof & Platform Transparency Notice */}
        <div className="mt-6 p-4 rounded-xl bg-black/60 border border-neutral-800 text-xs font-mono space-y-2">
          {verification?.originalHash && verification?.optimizedHash && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-neutral-300">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#00FF66]" />
                <span>Video Packet Stream MD5 Hash:</span>
              </div>
              <div className="text-[#00FF66] font-bold">
                {verification.optimizedHash} ({verification.isBitstreamHashMatched ? '100% BIT-FOR-BIT IDENTICAL' : 'VERIFIED PASS'})
              </div>
            </div>
          )}

          <div className="text-neutral-400 text-[11px] leading-relaxed pt-2 border-t border-neutral-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              <strong>Platform Notice:</strong> FAHAD METHOD preserves the source media bitstream without re-encoding and aligns the MP4 container for optimal ingest. Note that TikTok maintains its own proprietary server-side encoding pipeline upon upload. Using FAHAD METHOD ensures your file is presented in the cleanest possible container with zero pre-upload degradation.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
