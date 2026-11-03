import React, { useState } from 'react';
import { ShieldCheck, Film, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[#00FF66]/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-3.5 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#optimizer"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('optimizer');
          }}
          className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group"
        >
          <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-black border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.3)] group-hover:shadow-[0_0_20px_rgba(0,255,102,0.6)] transition-all">
            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="font-extrabold tracking-wider">
            FAHAD <span className="text-[#00FF66] neon-text-glow">METHOD</span>
          </span>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs sm:text-sm font-medium text-neutral-300">
          <button
            onClick={() => handleNavClick('optimizer')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'optimizer' ? 'text-[#00FF66] font-semibold' : 'hover:text-white'
            }`}
          >
            Video Optimizer
          </button>
          <button
            onClick={() => handleNavClick('terminal')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'terminal' ? 'text-[#00FF66] font-semibold' : 'hover:text-white'
            }`}
          >
            Activity Terminal
          </button>
          <button
            onClick={() => handleNavClick('analyzer')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'analyzer' ? 'text-[#00FF66] font-semibold' : 'hover:text-white'
            }`}
          >
            TikTok Analyzer
          </button>
          <button
            onClick={() => handleNavClick('tiktok-studio')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'tiktok-studio' ? 'text-[#00FF66] font-semibold' : 'hover:text-white'
            }`}
          >
            TikTok Studio
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'contact' ? 'text-[#00FF66] font-semibold' : 'hover:text-white'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('optimizer')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-black bg-[#00FF66] hover:bg-[#14ff75] rounded-lg shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:shadow-[0_0_30px_rgba(0,255,102,0.7)] transition-all whitespace-nowrap shrink-0 uppercase tracking-wider cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Optimize Video</span>
            <span className="xs:hidden">Optimize</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#00FF66]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-[#0a0f0c] border-b border-[#00FF66]/25 space-y-2 text-sm font-mono animate-fadeIn">
          <button
            onClick={() => handleNavClick('optimizer')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg transition-all ${
              activeSection === 'optimizer' ? 'bg-[#00FF66]/20 text-[#00FF66] font-bold' : 'text-neutral-300'
            }`}
          >
            → 01. Video Optimizer
          </button>
          <button
            onClick={() => handleNavClick('terminal')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg transition-all ${
              activeSection === 'terminal' ? 'bg-[#00FF66]/20 text-[#00FF66] font-bold' : 'text-neutral-300'
            }`}
          >
            → 02. Activity Terminal
          </button>
          <button
            onClick={() => handleNavClick('analyzer')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg transition-all ${
              activeSection === 'analyzer' ? 'bg-[#00FF66]/20 text-[#00FF66] font-bold' : 'text-neutral-300'
            }`}
          >
            → 03. TikTok Analyzer
          </button>
          <button
            onClick={() => handleNavClick('tiktok-studio')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg transition-all ${
              activeSection === 'tiktok-studio' ? 'bg-[#00FF66]/20 text-[#00FF66] font-bold' : 'text-neutral-300'
            }`}
          >
            → 04. TikTok Studio
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg transition-all ${
              activeSection === 'contact' ? 'bg-[#00FF66]/20 text-[#00FF66] font-bold' : 'text-neutral-300'
            }`}
          >
            → 05. Contact
          </button>
        </div>
      )}
    </header>
  );
};
