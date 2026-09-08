import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Maximize2 } from 'lucide-react';

interface HeroVideoProps {
  className?: string;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // Autoplay policy fallback: ensure muted
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => setIsPlaying(false));
      });
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Ambient Backlight Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-white/5 to-emerald-500/10 rounded-[28px] sm:rounded-[36px] blur-2xl opacity-70 pointer-events-none" />

      {/* Video Cinema Container */}
      <div
        ref={containerRef}
        onClick={togglePlay}
        className="group relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0b10] border border-white/15 shadow-2xl shadow-black/90 cursor-pointer select-none"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster="/hero/poster.jpg"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
        >
          <source src="/hero/page-1.mp4" type="video/mp4" />
          <source src="/local-videos/StartPage/Page-1.mp4" type="video/mp4" />
        </video>

        {/* Subtle Edge Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl sm:rounded-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 sm:top-5 left-3 sm:left-5 flex items-center gap-2 z-20 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-mono tracking-wider text-emerald-400 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            3D CGI LOOKDEV
          </span>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[11px] font-mono tracking-wider text-neutral-300 shadow-lg">
            60 FPS ✱ 4K MASTER
          </span>
        </div>

        {/* Floating Play / Pause Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-300 shadow-xl ${
              isPlaying ? 'opacity-0 scale-90 group-hover:opacity-60 group-hover:scale-100' : 'opacity-100 scale-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 fill-current text-emerald-400 ml-1" />
            )}
          </div>
        </div>

        {/* Bottom Bar Controls */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2 z-20">
          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 hover:border-emerald-500/50 text-white text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] tracking-wide text-neutral-300">Sound Off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="text-[11px] tracking-wide text-emerald-300 font-semibold">Sound On</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-1.5 sm:p-2 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 hover:border-emerald-500/50 text-neutral-300 hover:text-white transition-all shadow-lg cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
