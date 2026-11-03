import React from 'react';
import { ShieldCheck, Zap, Layers, Activity } from 'lucide-react';

interface HeroBannerProps {
  onStartOptimizing: () => void;
  onOpenTerminal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartOptimizing, onOpenTerminal }) => {
  return (
    <div className="relative overflow-hidden border-b border-[#00FF66]/15 bg-gradient-to-b from-[#0a120d] via-[#050505] to-[#050505] py-14 sm:py-20">
      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#00FF66 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Green glow aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF66]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Developer attribution kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1a0f] border border-[#00FF66]/30 text-xs font-mono text-[#00FF66] mb-6 shadow-[0_0_15px_rgba(0,255,102,0.15)]">
          <Zap className="w-3.5 h-3.5" />
          <span>DEVELOPED BY FAHAD · ORIGINAL STREAM PRESERVATION</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Professional Video Method <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] via-[#66ff99] to-[#00FF66] neon-text-glow">
            Optimization Platform
          </span>
        </h1>

        {/* Subtitle / Value proposition */}
        <p className="mt-5 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Inspired by the proprietary video processing methodology of <strong className="text-white">TikHaze</strong> and <strong className="text-white">Zilem Method</strong>. 
          Zero re-encoding, zero compression loss, and mathematically verified bitstream preservation with MP4 container &amp; metadata optimization.
        </p>

        {/* Key Architectural Guarantees Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="p-3 rounded-lg bg-[#0d140f] border border-[#00FF66]/20">
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
              QUALITY
            </div>
            <div className="text-sm font-bold text-white">100% Lossless</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Original video streams copied</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0d140f] border border-[#00FF66]/20">
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-[#00FF66]" />
              CONTAINER
            </div>
            <div className="text-sm font-bold text-white">Faststart Moov</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Instant progressive streaming</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0d140f] border border-[#00FF66]/20">
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-[#00FF66]" />
              VERIFICATION
            </div>
            <div className="text-sm font-bold text-white">MD5 Parity</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Bitstream hash proof</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0d140f] border border-[#00FF66]/20">
            <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
              TIKTOK
            </div>
            <div className="text-sm font-bold text-white">Studio Ready</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Optimized ingest structure</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartOptimizing}
            className="px-6 py-3 text-sm font-bold text-black bg-[#00FF66] hover:bg-[#1aff7b] rounded-xl shadow-[0_0_30px_rgba(0,255,102,0.5)] hover:shadow-[0_0_45px_rgba(0,255,102,0.8)] transition-all flex items-center gap-2.5 uppercase tracking-wider"
          >
            <ShieldCheck className="w-4 h-4" />
            Launch Video Optimizer
          </button>
          <button
            onClick={onOpenTerminal}
            className="px-5 py-3 text-sm font-semibold text-neutral-200 hover:text-white bg-[#0e1611] hover:bg-[#142018] border border-[#00FF66]/30 hover:border-[#00FF66]/60 rounded-xl transition-all flex items-center gap-2 font-mono"
          >
            <Activity className="w-4 h-4 text-[#00FF66]" />
            View Activity Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
