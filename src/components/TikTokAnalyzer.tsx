import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Info,
  RefreshCw,
  Sliders,
  Radio,
  Sparkles,
} from 'lucide-react';
import { TikTokAnalysisResult } from '../types/optimizer.js';

export const TikTokAnalyzer: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TikTokAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleLinks = [
    {
      label: 'Direct Test Stream (1080p H.264)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      label: 'TikTok Creator Benchmark Link',
      url: 'https://www.tiktok.com/@fahad16042026/video/7342819201948291023',
    },
  ];

  const handleAnalyze = async () => {
    if (!urlInput.trim()) {
      setError('Please paste a TikTok video link or direct video URL.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/tiktok-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        let msg = 'Failed to analyze TikTok media stream';
        try {
          const errData = await res.json();
          msg = errData.error || msg;
        } catch (_) {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        throw new Error(msg);
      }

      const data: TikTokAnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('TikTok analysis error:', err);
      setError(err.message || 'Failed to inspect TikTok media stream');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="analyzer" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-[#00FF66]/20 pb-4">
        <div className="text-xs font-mono text-[#00FF66] tracking-widest uppercase mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] inline-block shadow-[0_0_8px_#00FF66]" />
          SECTION 03 · TIKTOK MEDIA STREAM INSPECTOR
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          TikTok Video Analyzer
        </h2>
        <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
          Probe delivered video streams and inspect real encoding bitrate ladders, framerate, and audio compression using backend FFprobe.
        </p>
      </div>

      {/* URL Input Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#090e0b] border border-[#00FF66]/25 shadow-[0_0_20px_rgba(0,0,0,0.6)] mb-8">
        <label className="block text-xs font-mono text-neutral-300 uppercase mb-2 font-bold">
          Paste TikTok Video URL or CDN Stream:
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.tiktok.com/@username/video/..."
              className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-700 text-white placeholder-neutral-500 font-mono text-xs sm:text-sm focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] outline-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`px-7 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all ${
              isAnalyzing
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700'
                : 'bg-[#00FF66] hover:bg-[#1aff7b] text-black shadow-[0_0_25px_rgba(0,255,102,0.4)] cursor-pointer'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ANALYZING STREAM...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>ANALYZE VIDEO</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Link Buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00FF66]" />
            Test with verified stream:
          </span>
          {sampleLinks.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrlInput(s.url);
              }}
              className="text-[11px] font-mono text-neutral-300 hover:text-white bg-[#0e1711] hover:bg-[#142319] px-2.5 py-1 rounded border border-[#00FF66]/20 transition-all cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Delivered vs Source Distinction Notice Banner */}
          <div className="p-4 rounded-xl bg-[#0a120d] border border-[#00FF66]/30 text-xs font-mono space-y-1">
            <div className="flex items-center gap-2 text-[#00FF66] font-bold">
              <Info className="w-4 h-4 text-[#00FF66]" />
              <span>SOURCE SPECIFICATIONS VS. DELIVERED STREAM SPECIFICATIONS</span>
            </div>
            <div className="text-neutral-300 text-[11px] leading-relaxed">
              The metrics below represent the <strong>delivered stream</strong> as encoded and distributed across CDN servers, which is typically compressed compared to the creator's raw source file.
            </div>
          </div>

          {/* Social Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#090e0b] border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1 text-[11px]">
                <Eye className="w-3.5 h-3.5 text-[#00FF66]" />
                VIEWS
              </div>
              <div className="text-sm font-bold text-white">
                {result.metrics.views || 'Unavailable'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090e0b] border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1 text-[11px]">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                LIKES
              </div>
              <div className="text-sm font-bold text-white">
                {result.metrics.likes || 'Unavailable'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090e0b] border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1 text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                COMMENTS
              </div>
              <div className="text-sm font-bold text-white">
                {result.metrics.comments || 'Unavailable'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090e0b] border border-neutral-800">
              <div className="text-neutral-400 flex items-center gap-1.5 mb-1 text-[11px]">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                SHARES
              </div>
              <div className="text-sm font-bold text-white">
                {result.metrics.shares || 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Detailed Stream Parameters Matrix */}
          <div className="p-6 rounded-2xl bg-[#090e0b] border border-neutral-800">
            <h3 className="text-sm font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00FF66]" />
              FFprobe Delivered Media Stream Inspection
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 font-mono text-xs">
              {/* Resolution */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Delivered Resolution</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{result.deliveredResolution}</span>
              </div>

              {/* Dimensions */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Width × Height</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{result.width} × {result.height}</span>
              </div>

              {/* FPS */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Stream FPS</span>
                <span className="text-[#00FF66] font-bold text-sm mt-0.5 block">{result.fps} FPS</span>
              </div>

              {/* Avg FPS */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Average FPS</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{result.avgFps} FPS</span>
              </div>

              {/* Video Codec */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Video Codec</span>
                <span className="text-white font-bold text-sm mt-0.5 block uppercase">{result.videoCodec}</span>
              </div>

              {/* Audio Codec */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Audio Codec</span>
                <span className="text-white font-bold text-sm mt-0.5 block uppercase">{result.audioCodec}</span>
              </div>

              {/* Video Bitrate */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Video Bitrate</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {result.videoBitrate ? `${(result.videoBitrate / 1000).toFixed(0)} kbps` : 'Unavailable'}
                </span>
              </div>

              {/* Audio Bitrate */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Audio Bitrate</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {result.audioBitrate ? `${(result.audioBitrate / 1000).toFixed(0)} kbps` : 'Unavailable'}
                </span>
              </div>

              {/* File Size */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Delivered Size</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {result.fileSize ? `${(result.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Unavailable'}
                </span>
              </div>

              {/* Duration */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Duration</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {result.duration ? `${result.duration.toFixed(2)}s` : 'Unavailable'}
                </span>
              </div>

              {/* Aspect Ratio */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Aspect Ratio</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{result.aspectRatio}</span>
              </div>

              {/* Pixel Format */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Pixel Format</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{result.pixelFormat}</span>
              </div>

              {/* Color Space */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">Color Space</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{result.colorSpace}</span>
              </div>

              {/* HDR Status */}
              <div className="p-3 rounded-lg bg-black/50 border border-neutral-900">
                <span className="text-neutral-400 block text-[10px] uppercase">HDR Status</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {result.isHdr ? 'HDR Enabled' : 'SDR Standard'}
                </span>
              </div>
            </div>

            {/* Probe Notes */}
            {result.sourceVsDeliveredNotes && (
              <div className="mt-5 pt-4 border-t border-neutral-900 text-[11px] text-neutral-400 font-mono space-y-1">
                {result.sourceVsDeliveredNotes.map((note, i) => (
                  <div key={i}>· {note}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
