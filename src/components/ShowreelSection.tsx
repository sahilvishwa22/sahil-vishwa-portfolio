import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause } from 'lucide-react';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const ShowreelSection: React.FC = () => {
  const bannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const ambientVideoRef = useRef<HTMLVideoElement | null>(null);
  const fullVideoRef = useRef<HTMLVideoElement | null>(null);
  const fullAmbientVideoRef = useRef<HTMLVideoElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const playheadRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [durationStr, setDurationStr] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(true);
  const isDraggingTimeline = useRef(false);

  // Seamless auto-play loop and synchronization for banner & ambient backlight
  useEffect(() => {
    const mainVideo = bannerVideoRef.current;
    const ambVideo = ambientVideoRef.current;
    if (!mainVideo) return;

    mainVideo.muted = true;
    mainVideo.defaultMuted = true;
    mainVideo.loop = true;
    mainVideo.playsInline = true;

    if (ambVideo) {
      ambVideo.muted = true;
      ambVideo.defaultMuted = true;
      ambVideo.loop = true;
      ambVideo.playsInline = true;
    }

    // Keep ambient backlight video in lockstep sync with banner video
    const syncAmbient = () => {
      if (ambVideo && mainVideo) {
        if (Math.abs(ambVideo.currentTime - mainVideo.currentTime) > 0.12) {
          ambVideo.currentTime = mainVideo.currentTime;
        }
        if (mainVideo.paused && !ambVideo.paused) ambVideo.pause();
        if (!mainVideo.paused && ambVideo.paused) ambVideo.play().catch(() => {});
      }
    };

    mainVideo.addEventListener('timeupdate', syncAmbient);
    mainVideo.addEventListener('play', syncAmbient);
    mainVideo.addEventListener('seeking', syncAmbient);

    const onEnded = () => {
      mainVideo.currentTime = 0;
      mainVideo.play().catch(() => {});
      if (ambVideo) {
        ambVideo.currentTime = 0;
        ambVideo.play().catch(() => {});
      }
    };
    mainVideo.addEventListener('ended', onEnded);

    const startPlaying = () => {
      if (mainVideo) mainVideo.play().catch(() => {});
      if (ambVideo) ambVideo.play().catch(() => {});
    };

    startPlaying();

    // Gesture unlock for strict autoplay policies
    const unlock = () => {
      startPlaying();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('scroll', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('scroll', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });

    return () => {
      mainVideo.removeEventListener('timeupdate', syncAmbient);
      mainVideo.removeEventListener('play', syncAmbient);
      mainVideo.removeEventListener('seeking', syncAmbient);
      mainVideo.removeEventListener('ended', onEnded);
    };
  }, []);

  // Open Fullscreen: ALWAYS starts from the beginning (0:00)
  const openFullscreen = () => {
    setIsFullscreen(true);
    setCurrentTimeStr('00:00');
    setIsPlaying(true);

    setTimeout(() => {
      if (fullVideoRef.current) {
        fullVideoRef.current.currentTime = 0;
        fullVideoRef.current.muted = false;
        fullVideoRef.current.play().catch(() => {
          if (fullVideoRef.current) fullVideoRef.current.muted = true;
        });
      }
      if (fullAmbientVideoRef.current) {
        fullAmbientVideoRef.current.currentTime = 0;
        fullAmbientVideoRef.current.muted = true;
        fullAmbientVideoRef.current.play().catch(() => {});
      }
      if (progressBarRef.current) progressBarRef.current.style.height = '0%';
      if (playheadRef.current) playheadRef.current.style.bottom = '0%';
    }, 40);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    if (bannerVideoRef.current) {
      bannerVideoRef.current.play().catch(() => {});
    }
    if (ambientVideoRef.current) {
      ambientVideoRef.current.play().catch(() => {});
    }
  };

  const togglePlayPause = () => {
    const main = fullVideoRef.current;
    const amb = fullAmbientVideoRef.current;
    if (!main) return;

    if (main.paused) {
      main.play().catch(() => {});
      if (amb) amb.play().catch(() => {});
      setIsPlaying(true);
    } else {
      main.pause();
      if (amb) amb.pause();
      setIsPlaying(false);
    }
  };

  // Fullscreen timeline tracking and sync (60/120 FPS RAF loop for ultra-fluid movement)
  useEffect(() => {
    if (!isFullscreen) return;
    const main = fullVideoRef.current;
    const amb = fullAmbientVideoRef.current;
    if (!main) return;

    main.currentTime = 0;
    if (amb) amb.currentTime = 0;
    if (progressBarRef.current) progressBarRef.current.style.height = '0%';
    if (playheadRef.current) playheadRef.current.style.bottom = '0%';
    setCurrentTimeStr('00:00');
    setIsPlaying(!main.paused);

    const onLoadedMetadata = () => {
      setDurationStr(formatTime(main.duration));
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    if (main.readyState >= 1) {
      setDurationStr(formatTime(main.duration));
    }

    main.addEventListener('loadedmetadata', onLoadedMetadata);
    main.addEventListener('play', onPlay);
    main.addEventListener('pause', onPause);

    // Continuous 60/120 FPS RAF loop: eliminates ALL snappiness / stutter
    let animId: number;
    let lastSecond = -1;

    const render = () => {
      if (main && main.duration && !isDraggingTimeline.current) {
        const cur = main.currentTime;
        const dur = main.duration;
        const pct = (cur / dur) * 100;

        if (progressBarRef.current) {
          progressBarRef.current.style.height = `${pct}%`;
        }
        if (playheadRef.current) {
          playheadRef.current.style.bottom = `${pct}%`;
        }

        const sec = Math.floor(cur);
        if (sec !== lastSecond) {
          lastSecond = sec;
          setCurrentTimeStr(formatTime(cur));
        }

        // Synchronize ambient backlight with video
        if (amb && Math.abs(amb.currentTime - cur) > 0.12) {
          amb.currentTime = cur;
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      main.removeEventListener('loadedmetadata', onLoadedMetadata);
      main.removeEventListener('play', onPlay);
      main.removeEventListener('pause', onPause);
    };
  }, [isFullscreen]);

  // Vertical timeline scrub calculation (Bottom = 0%, Top = 100%)
  const seekFromClientY = (clientY: number) => {
    const track = timelineTrackRef.current;
    const main = fullVideoRef.current;
    const amb = fullAmbientVideoRef.current;
    if (!track || !main || !main.duration) return;

    const rect = track.getBoundingClientRect();
    // Progress starts from bottom (0) to top (1)
    const fractionFromBottom = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, fractionFromBottom));
    const targetTime = clamped * main.duration;

    main.currentTime = targetTime;
    if (amb) amb.currentTime = targetTime;

    const pct = clamped * 100;
    if (progressBarRef.current) {
      progressBarRef.current.style.height = `${pct}%`;
    }
    if (playheadRef.current) {
      playheadRef.current.style.bottom = `${pct}%`;
    }
    setCurrentTimeStr(formatTime(targetTime));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isDraggingTimeline.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    seekFromClientY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingTimeline.current) return;
    seekFromClientY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingTimeline.current) {
      isDraggingTimeline.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard navigation for fullscreen (Space = Play/Pause, Up/Down = Seek ±3s, ESC = Close)
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (fullVideoRef.current) {
          const t = Math.min(fullVideoRef.current.duration || 0, fullVideoRef.current.currentTime + 3);
          fullVideoRef.current.currentTime = t;
          if (fullAmbientVideoRef.current) fullAmbientVideoRef.current.currentTime = t;
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (fullVideoRef.current) {
          const t = Math.max(0, fullVideoRef.current.currentTime - 3);
          fullVideoRef.current.currentTime = t;
          if (fullAmbientVideoRef.current) fullAmbientVideoRef.current.currentTime = t;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <section id="showreel" className="w-full bg-[#0d0e13] text-white pt-16 sm:pt-20 pb-20 sm:pb-28 relative overflow-hidden border-b border-white/[0.08]">
      {/* Subtle deep ambient backing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3.5 shadow-lg shadow-emerald-950/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Commercial Showreel &bull; 2026 Reel</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white drop-shadow-md">
            Motion & CGI Showreel
          </h2>
        </div>

        {/* 
          Cinema Showcase with Dynamic Ambilight Backlight:
          - Ambient backlight video plays behind in real-time sync with high blur & saturation
          - Casts dynamic colorful halos matching the exact frames of the video
          - Widescreen cropped panoramic canvas fills width seamlessly
        */}
        <div className="relative w-full max-w-6xl">
          {/* Dynamic Video Backlight (Synchronized Ambilight Glow) */}
          <div 
            className="absolute -inset-4 sm:-inset-8 md:-inset-14 rounded-3xl overflow-hidden pointer-events-none opacity-80 sm:opacity-90 filter blur-2xl sm:blur-[70px] md:blur-[95px] saturate-[220%] transition-opacity duration-700 -z-10 will-change-transform"
            aria-hidden="true"
          >
            <video
              ref={ambientVideoRef}
              src="/showreel/showreel.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover scale-110 sm:scale-115 transform-gpu"
            />
          </div>

          {/* Widescreen Cropped Cinema Frame */}
          <div
            onClick={openFullscreen}
            data-cursor="play"
            className="relative w-full aspect-[16/10] sm:aspect-[21/9] max-h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95)] border border-white/15 ring-1 ring-white/10 group cursor-pointer transition-all duration-300 hover:border-emerald-500/40"
          >
            <video
              ref={bannerVideoRef}
              src="/showreel/showreel.mp4"
              poster="/showreel/showreel_poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center block group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />

            {/* Cinematic subtle edge vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Full Screen View with 100% Uncropped 9:16 Video + Dynamic Backlight & Vertical Timeline */}
      {isFullscreen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFullscreen();
          }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 select-none"
        >
          {/* Top Bar with Title, Timecode & Close Action */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-300">
                Commercial Showreel &bull; 9:16 Cinema
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-mono text-emerald-400 border border-white/10">
                {currentTimeStr} / {durationStr}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              aria-label="Close fullscreen view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cinema Stage: Video Canvas + Right-Side Vertical Timeline */}
          <div className="relative h-full max-h-[85vh] flex items-center justify-center gap-3 sm:gap-5 md:gap-7">
            
            {/* 9:16 Video Container (with Dynamic Ambilight Backlight) */}
            <div className="relative h-full aspect-[9/16] flex items-center justify-center">
              {/* Fullscreen Dynamic Ambilight Backlight */}
              <div 
                className="absolute -inset-6 sm:-inset-12 rounded-3xl overflow-hidden pointer-events-none opacity-85 sm:opacity-95 filter blur-3xl sm:blur-[85px] saturate-[220%] -z-10 will-change-transform"
                aria-hidden="true"
              >
                <video
                  ref={fullAmbientVideoRef}
                  src="/showreel/showreel.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover scale-115 transform-gpu"
                />
              </div>

              {/* Main Uncropped 9:16 Vertical Video with Click-to-Play/Pause */}
              <div 
                onClick={togglePlayPause}
                className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_0_90px_rgba(0,0,0,0.95)] border border-white/15 cursor-pointer group"
              >
                <video
                  ref={fullVideoRef}
                  src="/showreel/showreel.mp4"
                  poster="/showreel/showreel_poster.jpg"
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain block bg-black"
                />

                {/* Glassmorphic Play/Pause Overlay Indicator when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-opacity duration-200">
                    <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                      <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vertical Timeline Bar (Progresses Vertically from Bottom to Top) */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="h-full flex flex-col items-center justify-between py-1 shrink-0 select-none z-20"
            >
              {/* Top: End / Duration HUD */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
                  END
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-neutral-300 font-medium tracking-tight">
                  {durationStr}
                </span>
              </div>

              {/* Interactive Vertical Capsule Track */}
              <div
                ref={timelineTrackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative flex-1 w-2 sm:w-2.5 my-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 cursor-pointer border border-white/20 group/timeline flex items-end justify-center touch-none"
                title="Scrub video vertically (Bottom = 0:00, Top = End)"
              >
                {/* Visualizer Reference Ticks: 25%, 50%, 75% */}
                <span className="absolute bottom-[25%] -right-2 sm:-right-2.5 w-1.5 h-[1px] bg-white/30 pointer-events-none" />
                <span className="absolute bottom-[50%] -right-2.5 sm:-right-3 w-2.5 h-[1px] bg-emerald-400/60 pointer-events-none" />
                <span className="absolute bottom-[75%] -right-2 sm:-right-2.5 w-1.5 h-[1px] bg-white/30 pointer-events-none" />

                {/* Vertical Progress Fill (Grows UPWARD from bottom to top, 60/120 FPS fluid) */}
                <div
                  ref={progressBarRef}
                  style={{ height: '0%' }}
                  className="absolute bottom-0 inset-x-0 rounded-full bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.95)] pointer-events-none will-change-[height]"
                />

                {/* Precision Glowing Playhead Reticle (60/120 FPS fluid) */}
                <div
                  ref={playheadRef}
                  style={{ bottom: '0%' }}
                  className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-white border-2 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,1)] pointer-events-none group-hover/timeline:scale-125 transition-transform duration-150 will-change-[bottom]"
                />
              </div>

              {/* Bottom: Elapsed Time HUD */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-semibold tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
                  {currentTimeStr}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-emerald-500/80 uppercase">
                  LIVE
                </span>
              </div>
            </div>

          </div>

          <span className="text-xs font-mono text-neutral-500 mt-2.5">
            Click outside or press ESC to exit full screen &bull; Drag timeline or use Space/Arrows to navigate
          </span>
        </div>
      )}
    </section>
  );
};

