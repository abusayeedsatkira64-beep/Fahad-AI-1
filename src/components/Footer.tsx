import React from 'react';
import { Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#00FF66]/20 bg-black py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#09120c] border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66]">
            <Film className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-white">
            FAHAD <span className="text-[#00FF66]">METHOD</span>
          </span>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Professional Video Method Optimization
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Developed by <span className="text-[#00FF66] font-bold">Fahad</span>
        </div>
      </div>
    </footer>
  );
};
