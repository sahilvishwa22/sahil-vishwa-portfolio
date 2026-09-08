import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onServiceSelect?: (services: string[]) => void;
  onExploreWorks?: () => void;
  onOpenShowreel?: () => void;
}

// Kinetic headline lines & words configuration
const HEADLINE_LINES = [
  {
    id: 'line-1',
    words: [
      { text: 'Senior', key: 'senior' },
      { text: 'Visualizer', key: 'visualizer' },
    ],
  },
  {
    id: 'line-2',
    words: [
      { text: '&', key: 'amp' },
      { text: '3D', key: '3d', isAccent: true },
      { text: 'Generalist', key: 'generalist' },
    ],
  },
];

export const Hero: React.FC<HeroProps> = ({ onExploreWorks, onOpenShowreel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [isInside, setIsInside] = useState(false);
  const [isFullColor, setIsFullColor] = useState(false);
  const posRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0, initialized: false });

  // Base spotlight radius in B&W lookdev mode (in pixels)
  const BASE_SPOTLIGHT_RADIUS = 240;

  // Maximum radius to fully envelop any viewport diagonally
  const getMaxRadius = () => {
    if (typeof window === 'undefined') return 2500;
    return Math.hypot(window.innerWidth, window.innerHeight) * 1.25;
  };

  // Direct DOM references for GPU-accelerated 60/120fps styling without React render thrashing
  const maskLayerRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const shockwaveRef = useRef<HTMLDivElement | null>(null);
  const bloomRef = useRef<HTMLDivElement | null>(null);

  // Synchronized refs for uninterrupted RAF access
  const isFullColorRef = useRef(false);
  const isInsideRef = useRef(false);
  useEffect(() => {
    isFullColorRef.current = isFullColor;
  }, [isFullColor]);
  useEffect(() => {
    isInsideRef.current = isInside;
  }, [isInside]);

  // Transition state ref (allows smooth mid-flight interruptible aperture animation)
  const transitionRef = useRef({
    active: false,
    isOpening: false,
    startTime: 0,
    duration: 950,
    startRadius: BASE_SPOTLIGHT_RADIUS,
    targetRadius: BASE_SPOTLIGHT_RADIUS,
    currentRadius: BASE_SPOTLIGHT_RADIUS,
  });

  // Parallax tilt angles for 3D headline
  const heroWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const normX = Math.max(-1, Math.min(1, (mousePos.x - heroWidth / 2) / (heroWidth / 2)));
  const normY = Math.max(-1, Math.min(1, (mousePos.y - heroHeight / 2) / (heroHeight / 2)));
  const tiltX = -normY * 4.2; // degrees (-4.2 to +4.2)
  const tiltY = normX * 5.8;  // degrees (-5.8 to +5.8)

  // Guaranteed video autoplay handling & loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;

    const onEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', onEnded);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Hero video autoplay delayed until gesture:", err);
        const unlock = () => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('scroll', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
      });
    }

    return () => {
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  // Continuous RAF loop for buttery smooth cursor tracking and cinematic aperture bloom transition
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      const p = posRef.current;
      if (!p.initialized) {
        // Initial center spotlight placement over CRT monitor
        const defaultX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
        const defaultY = typeof window !== 'undefined' ? window.innerHeight * 0.40 : 400;
        p.currentX = defaultX;
        p.currentY = defaultY;
        p.targetX = defaultX;
        p.targetY = defaultY;
        p.initialized = true;
        setMousePos({ x: defaultX, y: defaultY });
      } else {
        const dx = p.targetX - p.currentX;
        const dy = p.targetY - p.currentY;

        if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
          p.currentX += dx * 0.16;
          p.currentY += dy * 0.16;
          setMousePos({ x: Math.round(p.currentX), y: Math.round(p.currentY) });
        }
      }

      // Handle aperture bloom transition physics & visuals
      const tr = transitionRef.current;
      let currentR = tr.currentRadius;
      let bloomOp = 0;
      let shockwaveOp = 0;

      if (tr.active) {
        const elapsed = timestamp - tr.startTime;
        const progress = Math.min(1, Math.max(0, elapsed / tr.duration));

        if (tr.isOpening) {
          // Opening: silky smooth ease-out quartic curve
          const ease = 1 - Math.pow(1 - progress, 4);
          currentR = tr.startRadius + (tr.targetRadius - tr.startRadius) * ease;

          // Luminous aperture shockwave rises swiftly and then diffuses out
          shockwaveOp = Math.sin(progress * Math.PI) * (1 - progress * 0.3) * 0.95;

          // Cinematic camera exposure flare peaks early (~25% of transition) then dissolves
          bloomOp = Math.sin(Math.pow(progress, 0.6) * Math.PI) * 0.25;

          // Reticle ring fades smoothly into the shockwave during the first 30% of opening
          if (reticleRef.current) {
            reticleRef.current.style.opacity = Math.max(0, 1 - progress * 3.3).toFixed(3);
          }
        } else {
          // Closing: ease-out cubic curve (contracts fast from edges and soft-settles into cursor)
          const ease = 1 - Math.pow(1 - progress, 3);
          currentR = tr.startRadius + (tr.targetRadius - tr.startRadius) * ease;

          // Contracting shockwave halo pulling inward
          shockwaveOp = Math.sin(progress * Math.PI) * 0.75;
          bloomOp = 0;

          // Reticle ring re-emerges as the aperture closes in
          if (reticleRef.current) {
            reticleRef.current.style.opacity = Math.max(0, (progress - 0.45) * 1.8 * (isInsideRef.current ? 0.95 : 0.55)).toFixed(3);
          }
        }

        tr.currentRadius = currentR;

        if (progress >= 1) {
          tr.active = false;
          currentR = tr.targetRadius;
          tr.currentRadius = currentR;
          shockwaveOp = 0;
          bloomOp = 0;
        }
      }

      const cx = Math.round(p.currentX);
      const cy = Math.round(p.currentY);
      const r = Math.round(currentR);

      // Direct GPU styling for Layer 2 (B&W + Film Grain with dynamic feathered mask)
      if (maskLayerRef.current) {
        if (!tr.active && isFullColorRef.current) {
          maskLayerRef.current.style.display = 'none';
        } else {
          maskLayerRef.current.style.display = 'block';
          maskLayerRef.current.style.opacity = '1';
          // Dynamic feather width: smoothly widens from 60% at 240px to 84% at max radius for dreamy diffusion
          const featherStart = Math.round(Math.min(84, 60 + ((r - 240) / 2000) * 24));
          const maskStr = `radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent 0%, transparent ${featherStart}%, black 100%)`;
          maskLayerRef.current.style.maskImage = maskStr;
          maskLayerRef.current.style.webkitMaskImage = maskStr;
        }
      }

      // Luminous aperture shockwave ring
      if (shockwaveRef.current) {
        if (shockwaveOp > 0.005) {
          shockwaveRef.current.style.opacity = shockwaveOp.toFixed(3);
          shockwaveRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
          shockwaveRef.current.style.width = `${r * 2}px`;
          shockwaveRef.current.style.height = `${r * 2}px`;
        } else {
          shockwaveRef.current.style.opacity = '0';
        }
      }

      // Exposure flare bloom overlay
      if (bloomRef.current) {
        bloomRef.current.style.opacity = bloomOp.toFixed(3);
      }

      // Reticle halo ring (when not transitioning)
      if (reticleRef.current && !tr.active) {
        reticleRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        reticleRef.current.style.opacity = isFullColorRef.current ? '0' : (isInsideRef.current ? '0.95' : '0.55');
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroSectionRef.current) return;
    const rect = heroSectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    posRef.current.targetX = x;
    posRef.current.targetY = y;
    setIsInside(true);
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined') {
      posRef.current.targetX = window.innerWidth / 2;
      posRef.current.targetY = window.innerHeight * 0.40;
    }
    setIsInside(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!heroSectionRef.current || e.touches.length === 0) return;
    const rect = heroSectionRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    posRef.current.targetX = x;
    posRef.current.targetY = y;
    setIsInside(true);
  };

  const handleLoop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    // Seamless loop slightly before end to avoid browser EOF freeze
    if (video.currentTime >= video.duration - 0.08) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    // Avoid triggering when double clicking interactive buttons or links
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, a, input, select')) return;

    if (heroSectionRef.current) {
      const rect = heroSectionRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      // Anchor origin directly to click location
      posRef.current.currentX = clickX;
      posRef.current.currentY = clickY;
      posRef.current.targetX = clickX;
      posRef.current.targetY = clickY;
    }

    const willBeFullColor = !isFullColor;
    setIsFullColor(willBeFullColor);

    const now = performance.now();
    const maxR = getMaxRadius();
    const currentR = transitionRef.current.currentRadius;

    transitionRef.current = {
      active: true,
      isOpening: willBeFullColor,
      startTime: now,
      duration: willBeFullColor ? 950 : 800,
      startRadius: currentR,
      targetRadius: willBeFullColor ? maxR : BASE_SPOTLIGHT_RADIUS,
      currentRadius: currentR,
    };
  };

  return (
    <section
      ref={heroSectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onDoubleClick={handleDoubleClick}
      className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden bg-[#090a0d] select-none border-b border-neutral-900/60 cursor-default"
      title="Double-click to toggle full color video"
    >
      {/* Floating Status Indicator when in Full Color Mode */}
      {isFullColor && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-24 right-6 sm:right-10 z-30 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-emerald-400/40 text-xs font-mono uppercase tracking-wider text-emerald-300 shadow-2xl shadow-emerald-950/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-white tracking-widest">COLOR PASS</span>
            <span className="text-white/30">&bull;</span>
            <span className="text-emerald-300/90 text-[11px]">DBL CLICK TO RESTORE LOOKDEV</span>
          </div>
        </motion.div>
      )}

      {/* 1. Base Full-Color Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          src="/hero/Page-1-TV.mp4"
          poster="/hero/poster-tv.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onEnded={handleLoop}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* 2. Black & White Filter Layer + Animated Film Grain with Dynamic Expanding Aperture Mask */}
      <div
        ref={maskLayerRef}
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        style={{
          backdropFilter: 'grayscale(100%) contrast(1.95) brightness(0.85)',
          WebkitBackdropFilter: 'grayscale(100%) contrast(1.95) brightness(0.85)',
          maskImage: `radial-gradient(circle ${BASE_SPOTLIGHT_RADIUS}px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, transparent 60%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${BASE_SPOTLIGHT_RADIUS}px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, transparent 60%, black 100%)`,
        }}
      >
        {/* Authentic High-Density Animated 35mm Film Grain Overlay - 4x Ultra-Fine Grain Size */}
        <div
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-40 mix-blend-overlay pointer-events-none will-change-transform animate-film-grain"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.85'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* 3. Luminous Aperture Shockwave / Optical Wave Ring (Expands & contracts with color transition) */}
      <div
        ref={shockwaveRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15 will-change-transform opacity-0 rounded-full"
        style={{
          border: '2px solid rgba(52, 211, 153, 0.85)',
          boxShadow: '0 0 55px 14px rgba(52, 211, 153, 0.4), inset 0 0 35px 8px rgba(255, 255, 255, 0.28)',
        }}
      >
        {/* Soft chromatic / prismatic diffusion glow */}
        <div className="absolute inset-[-6px] rounded-full border border-emerald-400/40 blur-[3px]" />
        <div className="absolute inset-[-14px] rounded-full border border-cyan-400/20 blur-[8px]" />
      </div>

      {/* 4. Soft Cinematic Camera Exposure Bloom / Light Surge during color reveal */}
      <div
        ref={bloomRef}
        className="absolute inset-0 pointer-events-none z-25 opacity-0 bg-gradient-to-tr from-amber-500/20 via-emerald-400/15 to-blue-400/20 mix-blend-screen backdrop-blur-[2px]"
      />

      {/* 5. Interactive Lens Reticle / Circular Halo Ring around the Mouse (Locked 1:1 with Mask) */}
      <div
        ref={reticleRef}
        className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 will-change-transform transition-opacity duration-300 hidden sm:block ${
          isFullColor ? 'opacity-0 pointer-events-none' : isInside ? 'opacity-95' : 'opacity-55'
        }`}
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          width: `${BASE_SPOTLIGHT_RADIUS * 2}px`,
          height: `${BASE_SPOTLIGHT_RADIUS * 2}px`,
        }}
      >
        {/* Soft glowing ring at the color-to-B&W mask threshold */}
        <div className="w-full h-full rounded-full border border-white/20 shadow-[0_0_35px_rgba(16,185,129,0.18),inset_0_0_20px_rgba(255,255,255,0.06)] relative">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-[9px] font-mono tracking-widest text-emerald-400 uppercase select-none flex items-center gap-1.5 shadow-lg whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>3D LOOKDEV &bull; DBL CLICK FOR COLOR</span>
          </div>
          <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* 4. Lighting & Vignette Overlays for Legibility */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 inset-x-0 h-80 sm:h-96 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/75 to-transparent pointer-events-none z-20" />

      {/* 5. Description Content Docked at the Bottom (Expansive Left-to-Right Full Width) */}
      <div className="relative z-30 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pb-12 sm:pb-16 lg:pb-20 pt-36">
        
        {/* Availability Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-black/80 backdrop-blur-md border border-white/15 text-neutral-200 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        </motion.div>

        {/* Grand 3D Kinetic Headline with Title Case Capitalization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{
            perspective: 1200,
            transformStyle: 'preserve-3d',
          }}
          className="relative mb-8 will-change-transform"
        >
          <div
            style={{
              transform: `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(14px)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="will-change-transform overflow-visible"
          >
            <h1 className="font-funnel text-5xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[92px] font-normal tracking-tight leading-[1.14] select-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.92)] overflow-visible">
              {HEADLINE_LINES.map((line, lineIdx) => (
                <div key={line.id} className="block overflow-visible py-1 sm:py-1.5">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.12,
                          delayChildren: 0.15 + lineIdx * 0.18,
                        },
                      },
                    }}
                    className="flex flex-wrap items-baseline gap-x-[0.28em] overflow-visible"
                  >
                    {line.words.map((word, wordIdx) => {
                      const globalIdx = lineIdx * 2 + wordIdx;
                      return (
                        <span key={word.key} className="inline-block overflow-visible">
                          <motion.span
                            variants={{
                              hidden: {
                                y: 28,
                                rotateX: -18,
                                opacity: 0,
                                filter: 'blur(5px)',
                              },
                              visible: {
                                y: 0,
                                rotateX: 0,
                                opacity: 1,
                                filter: 'blur(0px)',
                                transition: {
                                  duration: 0.8,
                                  ease: [0.16, 1, 0.3, 1],
                                },
                              },
                            }}
                            className="inline-block overflow-visible"
                          >
                            {/* Ambient floating breathing wave + Interactive tactile hover */}
                            <motion.span
                              animate={{
                                y: [0, -3.5, 0],
                              }}
                              transition={{
                                duration: 4.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: globalIdx * 0.24,
                              }}
                              whileHover={{
                                scale: 1.05,
                                y: -6,
                                transition: { type: 'spring', stiffness: 450, damping: 14 },
                              }}
                              className="inline-block overflow-visible cursor-default transition-all duration-300 specular-text hover:text-emerald-300 hover:drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]"
                            >
                              {word.text}
                            </motion.span>
                          </motion.span>
                        </span>
                      );
                    })}
                  </motion.div>
                </div>
              ))}
            </h1>
          </div>
        </motion.div>

        {/* Bottom Split Row: Bio on Left, Action Buttons on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-14">
          
          {/* Bio Description (Expansive Left Side) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl xl:max-w-3xl"
          >
            <p className="text-lg sm:text-xl md:text-2xl text-neutral-200 leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Commercial 3D CGI campaigns, high-velocity fashion motion graphics, and photorealistic lookdev. Leading visual design for <strong className="text-white font-medium">Westside (Tata Group)</strong>, <strong className="text-white font-medium">Sprint</strong>, and premier creative brands.
            </p>
          </motion.div>

          {/* Quick Action Buttons (Aligned to Right Side) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 lg:pb-1"
          >
            <button
              onClick={() => {
                if (onExploreWorks) {
                  onExploreWorks();
                } else {
                  const works = document.querySelector('#works');
                  if (works) works.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-7 py-3.5 rounded-full bg-white text-black text-sm font-semibold tracking-wide hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer shadow-2xl shadow-black/60"
            >
              <span>Explore The Works</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenShowreel && (
              <button
                onClick={onOpenShowreel}
                className="px-6 py-3.5 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 text-sm font-medium hover:bg-black hover:border-emerald-500/50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xl shadow-black/60"
              >
                <Play className="w-4 h-4 fill-current text-emerald-400" />
                <span>Watch Reel 2026</span>
              </button>
            )}

            <a
              href="/resume/Sahil_Vishwa_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 rounded-full bg-transparent text-neutral-300 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors drop-shadow-md"
            >
              View CV (PDF)
            </a>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
