import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Trophy, Sparkles } from 'lucide-react';
import { Project, ALL_PROJECTS } from '../data/projects';

interface VideoModalProps {
  project: Project | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSelectProject?: (project: Project) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ project, onClose, onNext, onPrev, onSelectProject }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);
  const [activeVideoSrc, setActiveVideoSrc] = React.useState<string>(project?.videoSrc || '');
  const [activeGalleryIndex, setActiveGalleryIndex] = React.useState<number>(0);
  const [isFullscreenLightbox, setIsFullscreenLightbox] = React.useState<boolean>(false);

  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  const [isScrubbing, setIsScrubbing] = React.useState<boolean>(false);
  const horizontalTrackRef = useRef<HTMLDivElement | null>(null);
  const verticalTrackRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const scrubHorizontal = (clientX: number) => {
    if (!horizontalTrackRef.current || !videoRef.current || !duration) return;
    const rect = horizontalTrackRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
    const newTime = pct * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const scrubVertical = (clientY: number) => {
    if (!verticalTrackRef.current || !videoRef.current || !duration) return;
    const rect = verticalTrackRef.current.getBoundingClientRect();
    // Bottom to Top: rect.bottom = 0%, rect.top = 100%
    const pct = Math.min(Math.max(0, (rect.bottom - clientY) / rect.height), 1);
    const newTime = pct * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleHorizontalStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    scrubHorizontal(clientX);

    const onMove = (moveEv: MouseEvent | TouchEvent) => {
      const x = 'touches' in moveEv ? (moveEv as TouchEvent).touches[0].clientX : (moveEv as MouseEvent).clientX;
      scrubHorizontal(x);
    };
    const onEnd = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  const handleVerticalStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    scrubVertical(clientY);

    const onMove = (moveEv: MouseEvent | TouchEvent) => {
      const y = 'touches' in moveEv ? (moveEv as TouchEvent).touches[0].clientY : (moveEv as MouseEvent).clientY;
      scrubVertical(y);
    };
    const onEnd = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  useEffect(() => {
    if (project) {
      setActiveVideoSrc(project.videoSrc || project.makingOfVideoSrc || '');
      setActiveGalleryIndex(0);
      setIsFullscreenLightbox(false);
    }
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreenLightbox) {
          setIsFullscreenLightbox(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowRight') {
        if (project?.galleryImages && project.galleryImages.length > 1) {
          setActiveGalleryIndex((prev) => (prev + 1) % project.galleryImages!.length);
        } else if (onNext) {
          onNext();
        }
      }
      if (e.key === 'ArrowLeft') {
        if (project?.galleryImages && project.galleryImages.length > 1) {
          setActiveGalleryIndex((prev) => (prev - 1 + project.galleryImages!.length) % project.galleryImages!.length);
        } else if (onPrev) {
          onPrev();
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, isFullscreenLightbox, project]);

  useEffect(() => {
    if (videoRef.current) {
      const targetSpeed = project?.playbackRate || ((project?.id === 'proj-2' || project?.title?.toLowerCase().includes('haar')) ? 3.0 : 1.0);
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = targetSpeed;
      videoRef.current.muted = false;
      setIsMuted(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (videoRef.current) videoRef.current.playbackRate = targetSpeed;
            setIsPlaying(true);
            setIsMuted(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.playbackRate = targetSpeed;
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
          });
      }
    }
  }, [activeVideoSrc, project]);

  // Smooth 60fps requestAnimationFrame progress tracking loop
  useEffect(() => {
    let animId: number;
    const updateProgress = () => {
      if (videoRef.current && !isScrubbing && !videoRef.current.paused) {
        setCurrentTime(videoRef.current.currentTime);
        if (videoRef.current.duration) {
          setDuration(videoRef.current.duration);
        }
      }
      animId = requestAnimationFrame(updateProgress);
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [isScrubbing, activeVideoSrc]);

  if (!project) return null;

  const isShowingMakingOf = activeVideoSrc === project.makingOfVideoSrc;
  const currentImageSrc = project.galleryImages ? project.galleryImages[activeGalleryIndex] : (project.posterSrc || '');

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <AnimatePresence>
      {/* 1. True 100% Screen Lightbox Mode (When image or product range is clicked) */}
      {isFullscreenLightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none"
        >
          {/* Close Lightbox Button */}
          <button
            onClick={() => setIsFullscreenLightbox(false)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-2xl"
            aria-label="Exit Fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Top Title Overlay */}
          <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-bold">
              FULLSCREEN VIEW
            </span>
            <span className="text-sm font-medium text-white/90 hidden sm:inline">
              {project.title}
            </span>
          </div>

          {/* Fullscreen Image Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
            >
              <motion.img
                src={currentImageSrc}
                alt={project.title}
                className="max-h-[94vh] max-w-[94vw] w-auto h-auto object-contain pointer-events-none drop-shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>

          {/* Multi-Angle Carousel Navigation Controls in Fullscreen */}
          {project.galleryImages && project.galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveGalleryIndex((prev) => (prev - 1 + project.galleryImages!.length) % project.galleryImages!.length);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-2xl"
                aria-label="Previous angle"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveGalleryIndex((prev) => (prev + 1) % project.galleryImages!.length);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-2xl"
                aria-label="Next angle"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              <div className="absolute bottom-6 inset-x-0 z-50 flex items-center justify-center gap-2">
                {project.galleryImages.map((imgSrc, idx) => (
                  <button
                    key={imgSrc}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveGalleryIndex(idx);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md ${
                      activeGalleryIndex === idx
                        ? 'bg-emerald-400 text-black font-bold border border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-105'
                        : 'bg-black/80 text-neutral-300 border border-white/20 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>Angle 0{idx + 1}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* 2. Standard Cinema Theatre Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-[#121316] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Viewport */}
          <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] sm:min-h-[450px] lg:min-h-[580px] overflow-hidden group">
            {project.isStill && !isShowingMakingOf ? (
              <>
                {/* Clickable Image Viewport */}
                <div
                  onClick={() => {
                    if (project.makingOfVideoSrc) {
                      setActiveVideoSrc(project.makingOfVideoSrc);
                    } else {
                      setIsFullscreenLightbox(true);
                    }
                  }}
                  className="w-full h-full flex items-center justify-center relative cursor-pointer overflow-hidden group/img"
                  title={project.makingOfVideoSrc ? "Click to play breakdown video" : "Click to view true fullscreen"}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageSrc}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="w-full h-full flex items-center justify-center overflow-hidden"
                    >
                      <motion.img
                        src={currentImageSrc}
                        alt={project.title}
                        className="max-h-[85vh] w-auto max-w-full object-contain pointer-events-none"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Overlay Badge on Hover */}
                  {project.makingOfVideoSrc ? (
                    <div className="absolute inset-0 bg-black/30 group-hover/img:bg-black/10 transition-all flex items-center justify-center">
                      <div className="px-4 py-2.5 rounded-full bg-amber-500/90 text-black font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-amber-300 transform group-hover/img:scale-105 transition-transform">
                        <Play className="w-4 h-4 fill-current" />
                        <span>Click Main Artwork to Play Breakdown Video</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-black/75 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover/img:opacity-100 transition-all flex items-center gap-2 shadow-xl">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Expand True Fullscreen</span>
                    </div>
                  )}
                </div>

                {/* Multi-Image Carousel Controls */}
                {project.galleryImages && project.galleryImages.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGalleryIndex((prev) => (prev - 1 + project.galleryImages!.length) % project.galleryImages!.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/75 hover:bg-black text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-2xl"
                      aria-label="Previous angle"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveGalleryIndex((prev) => (prev + 1) % project.galleryImages!.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/75 hover:bg-black text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-2xl"
                      aria-label="Next angle"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Carousel Thumbnail Pills */}
                    <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center gap-2">
                      {project.galleryImages.map((imgSrc, idx) => (
                        <button
                          key={imgSrc}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGalleryIndex(idx);
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md ${
                            activeGalleryIndex === idx
                              ? 'bg-emerald-400 text-black font-bold border border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                              : 'bg-black/80 text-neutral-300 border border-white/20 hover:border-white/40 hover:text-white'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Angle 0{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={activeVideoSrc || project.videoSrc}
                  poster={project.posterSrc}
                  playsInline
                  autoPlay
                  loop
                  muted={isMuted}
                  onClick={togglePlay}
                  onTimeUpdate={() => {
                    if (videoRef.current && !isScrubbing) {
                      setCurrentTime(videoRef.current.currentTime);
                      if (videoRef.current.duration) {
                        setDuration(videoRef.current.duration);
                      }
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration || 0);
                    }
                  }}
                  className={`cursor-pointer ${
                    project.isVertical
                      ? 'max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full object-contain rounded-xl my-2 shadow-2xl'
                      : 'w-full h-full object-contain'
                  }`}
                />

                {/* Floating Play/Pause Indicator on Click */}
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-transparent cursor-pointer pointer-events-none"
                >
                  {!isPlaying && (
                    <div className="p-4 rounded-full bg-black/60 backdrop-blur-sm text-white border border-white/20">
                      <Play className="w-8 h-8 fill-current translate-x-0.5" />
                    </div>
                  )}
                </div>

                {/* Active View Mode Overlay Badge */}
                {isShowingMakingOf && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-black border border-amber-300 shadow-xl flex items-center gap-1.5">
                      <span>🎬 MAKING OF / BTS BREAKDOWN</span>
                    </span>
                    {project.isStill && (
                      <button
                        onClick={() => setActiveVideoSrc('')}
                        className="px-3 py-1 rounded-full text-xs font-mono bg-black/80 hover:bg-black text-amber-300 border border-amber-400/50 transition-colors cursor-pointer backdrop-blur-md shadow-xl"
                      >
                        🖼️ View Still Artwork
                      </button>
                    )}
                  </div>
                )}

                {/* Ultra-Minimal Vertical Timeline (Bottom to Top) in black side region for 9:16 vertical videos */}
                {project.isVertical && (
                  <div className="absolute right-2.5 sm:right-5 top-8 bottom-20 z-30 flex items-center gap-1.5">
                    <div
                      ref={verticalTrackRef}
                      onMouseDown={handleVerticalStart}
                      onTouchStart={handleVerticalStart}
                      className="relative w-1 sm:w-1.5 hover:w-2.5 h-full bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-end group/vscrub"
                      title="Vertical Timeline - Drag up/down to scrub video (Bottom to Top)"
                    >
                      <div
                        className="w-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        style={{ height: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-300 border border-white shadow-[0_0_8px_rgba(52,211,153,1)] opacity-0 group-hover/vscrub:opacity-100 transition-opacity pointer-events-none"
                        style={{ bottom: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 5px)` }}
                      />
                    </div>

                    <div className="hidden sm:flex flex-col items-center justify-between h-full py-0.5 text-[9px] font-mono text-neutral-400 select-none pointer-events-none">
                      <span className="px-1 py-0.5 rounded bg-black/70 border border-white/10">
                        {formatTime(duration)}
                      </span>
                      <span className="px-1 py-0.5 rounded bg-black/90 text-emerald-400 border border-emerald-500/30">
                        {formatTime(currentTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Video Controls Bar */}
                <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  {/* Ultra-Minimal Horizontal Timeline Track for 16:9 widescreen videos */}
                  {!project.isVertical && (
                    <div
                      ref={horizontalTrackRef}
                      onMouseDown={handleHorizontalStart}
                      onTouchStart={handleHorizontalStart}
                      className="relative w-full h-1 hover:h-2 bg-white/15 hover:bg-white/25 rounded-full cursor-pointer transition-all duration-200 overflow-visible group/hscrub"
                      title="Horizontal Timeline - Click/Drag to scrub video"
                    >
                      <div
                        className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] relative"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-300 border border-white shadow-[0_0_8px_rgba(52,211,153,1)] scale-0 group-hover/hscrub:scale-100 transition-transform" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <button
                        onClick={toggleMute}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <span className="text-xs text-neutral-300 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      <span className="text-xs text-neutral-400 font-mono hidden sm:inline border-l border-white/10 pl-3">
                        {isShowingMakingOf ? 'Making Of Breakdown' : `${project.aspectRatio} • ${project.duration ? `${project.duration}s` : 'HD'}`}
                      </span>
                    </div>

                    <button
                      onClick={handleFullscreen}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="w-full lg:w-96 p-6 sm:p-8 flex flex-col justify-between bg-[#141519] border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto">
            <div>
              {/* Category & Client Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  {project.category}
                </span>
                <span className="text-xs text-neutral-400">
                  {project.client}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-3">
                {project.title}
              </h3>

              {/* Award Banner Block */}
              {project.award && (
                <div className={`mb-6 p-4 rounded-2xl border shadow-xl relative overflow-hidden ${
                  project.award.rank === 'GOLD WINNER'
                    ? 'bg-gradient-to-b from-[#2a1d08] via-[#1d1607] to-[#141519] border-amber-400/50 text-amber-200 shadow-amber-950/40'
                    : 'bg-gradient-to-b from-[#1b2234] via-[#161c28] to-[#141519] border-slate-300/50 text-slate-200 shadow-slate-950/40'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Trophy className={`w-4 h-4 ${
                      project.award.rank === 'GOLD WINNER' ? 'text-amber-400 fill-amber-400/30' : 'text-slate-300 fill-slate-300/30'
                    }`} />
                    <span className={`font-mono text-xs font-bold uppercase tracking-widest ${
                      project.award.rank === 'GOLD WINNER' ? 'text-amber-300' : 'text-slate-200'
                    }`}>
                      {project.award.rank} &bull; {project.award.year}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {project.award.title}
                  </h4>
                  <p className="text-xs font-mono text-neutral-300">
                    {project.award.category} &bull; <span className={`font-bold ${
                      project.award.rank === 'GOLD WINNER' ? 'text-amber-300' : 'text-slate-200'
                    }`}>{project.award.subCategory}</span>
                  </p>
                  {project.award.agency && (
                    <p className="text-[11px] font-mono text-neutral-400 mt-1">
                      Agency: <span className="text-white">{project.award.agency}</span>
                    </p>
                  )}
                  {project.award.link && (
                    <a
                      href={project.award.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono hover:bg-amber-400/30 transition-colors"
                    >
                      <span>Official Winners Portal</span>
                      <ExternalLink className="w-3 h-3 text-amber-300" />
                    </a>
                  )}
                </div>
              )}

              {/* Role */}
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6 pb-4 border-b border-white/10">
                Role: <span className="text-white">{project.role}</span>
              </p>

              {/* Description if any */}
              {project.description && (
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  {project.description}
                </p>
              )}

              {/* Process Breakdown Video Card with Dynamic Live Mini Preview (Swaps between Breakdown and Main Render) */}
              {project.makingOfVideoSrc && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-b from-[#231a0c] via-[#1a1409] to-[#121316] border border-amber-500/40 shadow-xl overflow-hidden group/breakdown">
                  {/* Live Mini Preview playing on description side */}
                  <div 
                    onClick={() => setActiveVideoSrc(isShowingMakingOf ? (project.videoSrc || '') : project.makingOfVideoSrc!)}
                    className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-amber-400/40 group-hover/breakdown:border-amber-300 transition-colors cursor-pointer group/minivid shadow-2xl bg-black"
                    title={isShowingMakingOf ? "Click to switch back to Main Render in main view" : "Click to play Breakdown in main view"}
                  >
                    {isShowingMakingOf ? (
                      /* When breakdown is in main view, show Main Render video/image in mini preview */
                      project.isStill || !project.videoSrc ? (
                        <img
                          src={project.posterSrc}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={project.videoSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      /* When main render is in main view, show Breakdown video in mini preview */
                      <video
                        src={project.makingOfVideoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/30 group-hover/minivid:bg-black/10 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg transform group-hover/minivid:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/50 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>{isShowingMakingOf ? 'MAIN RENDER PREVIEW' : 'BTS BREAKDOWN PREVIEW'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                        <span>{isShowingMakingOf ? 'MAIN RENDER PREVIEW' : 'PROCESS BREAKDOWN VIDEO'}</span>
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        {isShowingMakingOf ? (
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Breakdown in main view
                          </span>
                        ) : (
                          'Click preview to play breakdown in main view'
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveVideoSrc(isShowingMakingOf ? (project.videoSrc || '') : project.makingOfVideoSrc!)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer shrink-0 font-bold ${
                        isShowingMakingOf
                          ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                          : 'bg-amber-400 text-black border-amber-300 hover:bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      }`}
                    >
                      {isShowingMakingOf ? 'View Main Render' : 'Switch to Breakdown'}
                    </button>
                  </div>
                </div>
              )}

              {/* Related Product Range Card for Mother's Day CGI or Multi-Gallery Items */}
              {project.galleryImages && project.galleryImages.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-b from-[#14202c] via-[#0f1722] to-[#121316] border border-sky-500/40 shadow-xl overflow-hidden group/product">
                  {/* Interactive Product Range Preview */}
                  <div 
                    onClick={() => {
                      const targetProduct = ALL_PROJECTS.find(p => p.id === 'still-product-range');
                      if (targetProduct && onSelectProject) {
                        onSelectProject(targetProduct);
                      } else {
                        setIsFullscreenLightbox(true);
                      }
                    }}
                    className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden mb-3.5 border border-sky-400/40 group-hover/product:border-sky-300 transition-colors cursor-pointer group/imgpreview shadow-2xl bg-black"
                    title="Click to open Westside Beauty Product Range modal"
                  >
                    <img
                      src={project.galleryImages[0]}
                      alt="Related Product Range"
                      className="w-full h-full object-cover group-hover/imgpreview:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover/imgpreview:bg-black/10 transition-all flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-sky-400 text-black flex items-center justify-center shadow-lg transform group-hover/imgpreview:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-sky-400/50 text-[10px] font-mono font-bold text-sky-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      <span>RELATED PRODUCT RANGE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>WESTSIDE PRODUCT RANGE</span>
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        3D Packaging created for Mother's Day CGI
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const targetProduct = ALL_PROJECTS.find(p => p.id === 'still-product-range');
                        if (targetProduct && onSelectProject) {
                          onSelectProject(targetProduct);
                        } else {
                          setIsFullscreenLightbox(true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono bg-sky-400 text-black border border-sky-300 hover:bg-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all cursor-pointer shrink-0 font-bold"
                    >
                      View Range
                    </button>
                  </div>
                </div>
              )}

              {/* Tools Used */}
              <div className="mb-6">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-2 font-mono">
                  Software Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-neutral-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-2 font-mono">
                  Disciplines
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-neutral-400 px-2 py-0.5 rounded bg-neutral-800/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom: Navigation */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onPrev && (
                  <button
                    onClick={onPrev}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                )}
                {onNext && (
                  <button
                    onClick={onNext}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
