import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const [mumbaiTime, setMumbaiTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setMumbaiTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07080a] text-neutral-300 py-12 relative overflow-hidden select-none">
      


      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Brand & Location */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="font-funnel text-lg font-medium tracking-tight text-white">
              Sahil Vishwa
            </span>
            <span className="text-xl text-emerald-400 select-none">&#10033;</span>
          </div>

          <span className="hidden sm:inline text-neutral-600">&bull;</span>

          <span className="text-xs text-neutral-400 font-mono">
            Mumbai, India {mumbaiTime && `(${mumbaiTime} IST)`}
          </span>
        </div>

        {/* Center: Roles */}
        <div className="text-xs text-neutral-400 text-center">
          Senior Visualizer &bull; Motion Graphic Artist &bull; 3D Generalist
        </div>

        {/* Right: Back to Top */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Sahil Vishwa
          </span>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-[#111217] border border-white/10 hover:border-emerald-400 text-white transition-colors cursor-pointer shadow-xs"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
