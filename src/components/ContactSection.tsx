import React from 'react';
import { ExternalLink, Film, ShieldCheck, Heart } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#00FF66]/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Developer Info */}
        <div>
          <div className="text-xs font-mono text-[#00FF66] tracking-widest uppercase mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] inline-block shadow-[0_0_8px_#00FF66]" />
            SECTION 06 · DEVELOPER & CONTACT
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Connect With Fahad
          </h2>
          <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
            FAHAD METHOD is an original video method optimization platform developed to provide creators with genuine lossless MP4 container and metadata restructuring without sacrificing encoded quality.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-neutral-400 bg-[#09110b] px-3.5 py-2 rounded-lg border border-[#00FF66]/30">
            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
            <span>Zero Compression Loss · 100% Bitstream Preserved</span>
          </div>
        </div>

        {/* Official Contact Links */}
        <div className="space-y-3">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/fahad31674"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-2xl bg-[#090e0b] hover:bg-[#0e1711] border border-[#00FF66]/30 hover:border-[#00FF66] transition-all flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold font-mono">
                f
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-[#00FF66] transition-colors">
                  Facebook Profile
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  facebook.com/fahad31674
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-[#00FF66] transition-colors" />
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@fahad16042026"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 rounded-2xl bg-[#090e0b] hover:bg-[#0e1711] border border-[#00FF66]/30 hover:border-[#00FF66] transition-all flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66] font-bold font-mono">
                TT
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-[#00FF66] transition-colors">
                  TikTok Official
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  tiktok.com/@fahad16042026
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-[#00FF66] transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
};
