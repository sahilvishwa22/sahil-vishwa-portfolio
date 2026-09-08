import React, { useState, useRef, useEffect } from 'react';
import { Play, Maximize2, Trophy } from 'lucide-react';
import { Project, ALL_PROJECTS } from '../data/projects';

interface FolioScrollSectionProps {
  onSelectProject: (project: Project) => void;
}

// Curate high contrast, colorful commercial projects with Gold Winner in MIDDLE and Silver Winner at LAST
const CURATED_TITLES = [
  'BohoState',                   // Terracotta / Earthy Orange
  'Denim CGI',                   // Deep Indigo Blue
  'EveryStyle',                  // Vibrant Yellow
  'Sci-Fi Starship Concept',     // Cosmic Purple / Deep Blue
  'F1 CGI',                      // Fiery Red
  'CotonStory',                  // Soft Cream / Pastel
  'Alienate Sci-Fi Environment', // Emerald Green
  'Vinyl CGI',                   // Gold Winner (MIDDLE - Index 7)
  'AllThingsPrettyLace',         // Magenta / Pink
  'Mechanical Keyboard CGI',     // Cyan / Tech RGB
  'RobotMan Mech Character',     // High-Detail Mech & BTS Breakdown
  'GameSetFlex',                 // Dark Athletic / Neon Accent
  'Winblendon Edit',             // Lush Grass Green
  'Xeno-CGI',                    // Metallic Chrome / Sci-Fi
  'Haar-Raah'                    // Silver Winner (LAST - Index 14)
];

export const FolioScrollSection: React.FC<FolioScrollSectionProps> = ({ onSelectProject }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [videoMountIndex, setVideoMountIndex] = useState<number | null>(null);
  const videoUnmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spacingRef = useRef({ cardSpacing: 145, cardWidth: 245 });

  // Map curated titles in exact ordered sequence for maximum color contrast alternation
  const displayProjects = CURATED_TITLES.map((title) =>
    ALL_PROJECTS.find((p) => p.title.toLowerCase().includes(title.toLowerCase()))
  ).filter((p): p is Project => p !== undefined);

  // 6x repeat array for continuous seamless infinite loop with lightweight DOM footprint
  const REPEAT_COUNT = 6;
  const marqueeVideos = Array.from({ length: REPEAT_COUNT }).flatMap(() => displayProjects);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const lastClientXRef = useRef(0);
  const velocityRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const isMovedRef = useRef(false);
  const initializedRef = useRef(false);
  const hoveredIndexRef = useRef<number | null>(null);
  const clickedProjectRef = useRef<Project | null>(null);

  // Track responsive card geometry on resize
  useEffect(() => {
    const updateSpacing = () => {
      const w = window.innerWidth;
      if (w < 640) {
        spacingRef.current = { cardSpacing: 125, cardWidth: 190 };
      } else if (w < 768) {
        spacingRef.current = { cardSpacing: 135, cardWidth: 220 };
      } else {
        spacingRef.current = { cardSpacing: 145, cardWidth: 245 };
      }
    };
    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  // Butter-smooth 60/120fps continuous infinite loop, silky drag scrubbing & zero layout thrashing
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const track = trackRef.current;
      if (!track) {
        animId = requestAnimationFrame(updateLoop);
        return;
      }

      const { cardSpacing, cardWidth } = spacingRef.current;
      const sequenceWidth = displayProjects.length * cardSpacing;

      // Initialize track offset smoothly in the center buffer on first frame
      if (!initializedRef.current && sequenceWidth > 0) {
        currentOffsetRef.current = -2.5 * sequenceWidth;
        initializedRef.current = true;
      }

      // 1. Handle auto-scroll & momentum coasting
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.08) {
          currentOffsetRef.current += velocityRef.current;
          velocityRef.current *= 0.88; // Crisp, controlled deceleration
        } else {
          velocityRef.current = 0;
          if (hoveredIndexRef.current === null) {
            currentOffsetRef.current -= 0.65; // Gentle, elegant auto-scroll speed
          }
        }
      }

      // 2. Seamless Continuous Infinite Loop Wrapping
      // Keeps offset comfortably in the middle sets without any visual jump or restart
      if (sequenceWidth > 0) {
        while (currentOffsetRef.current <= -3.5 * sequenceWidth) {
          currentOffsetRef.current += sequenceWidth;
          if (hoveredIndexRef.current !== null) {
            const nextIdx = hoveredIndexRef.current - displayProjects.length;
            hoveredIndexRef.current = nextIdx;
            setHoveredIndex(nextIdx);
            setVideoMountIndex(nextIdx);
          }
        }
        while (currentOffsetRef.current >= -1.5 * sequenceWidth) {
          currentOffsetRef.current -= sequenceWidth;
          if (hoveredIndexRef.current !== null) {
            const nextIdx = hoveredIndexRef.current + displayProjects.length;
            hoveredIndexRef.current = nextIdx;
            setHoveredIndex(nextIdx);
            setVideoMountIndex(nextIdx);
          }
        }
      }

      // 3. Apply GPU transform to track
      track.style.transform = `translate3d(${currentOffsetRef.current.toFixed(2)}px, 0, 0)`;

      // 4. Pure Mathematical Calculation — ZERO Layout Thrashing / ZERO Forced Reflows
      const screenCenter = window.innerWidth / 2;
      const maxCullDist = window.innerWidth * 0.85;

      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const cardCenter = currentOffsetRef.current + i * cardSpacing + (cardWidth / 2);
        const dx = cardCenter - screenCenter;

        // Skip off-screen cards to keep CPU & GPU ultra lightweight
        if (Math.abs(dx) > maxCullDist) continue;

        const u = Math.max(-1.5, Math.min(1.5, dx / (window.innerWidth * 0.40)));

        const curveY = (u * u) * 85; // Deep dramatic U-shaped 3D shelf curve arch
        const curveScale = 1.05 - Math.min(0.38, Math.abs(u) * 0.22);
        const curveRotateY = -u * 42; // Deep 3D cylindrical rotation facing inward to center
        const curveRotateZ = -u * 5;

        el.style.setProperty('--curve-y', `${curveY.toFixed(1)}px`);
        el.style.setProperty('--curve-scale', curveScale.toFixed(3));
        el.style.setProperty('--curve-rot-y', `${curveRotateY.toFixed(2)}deg`);
        el.style.setProperty('--curve-rot-z', `${curveRotateZ.toFixed(2)}deg`);
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [displayProjects.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    isMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    lastClientXRef.current = e.clientX;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastClientXRef.current;
    const dist = Math.hypot(
      e.clientX - dragStartXRef.current,
      e.clientY - dragStartYRef.current
    );
    if (dist > 8) {
      isMovedRef.current = true;
    }
    currentOffsetRef.current += deltaX;
    // Low-pass filter for smooth, natural flick momentum
    velocityRef.current = velocityRef.current * 0.35 + deltaX * 0.65;
    lastClientXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    const dist = Math.hypot(
      e.clientX - dragStartXRef.current,
      e.clientY - dragStartYRef.current
    );
    if (dist < 8 && clickedProjectRef.current) {
      onSelectProject(clickedProjectRef.current);
      clickedProjectRef.current = null;
    }
    // Limit release flick so it coasts gently without flying wildly
    velocityRef.current = Math.max(-12, Math.min(12, velocityRef.current * 0.5));
  };

  const handleMouseEnter = (idx: number) => {
    if (videoUnmountTimerRef.current) clearTimeout(videoUnmountTimerRef.current);
    hoveredIndexRef.current = idx;
    setHoveredIndex(idx);
    setVideoMountIndex(idx);
  };

  const handleMouseLeave = () => {
    hoveredIndexRef.current = null;
    setHoveredIndex(null);
    videoUnmountTimerRef.current = setTimeout(() => {
      setVideoMountIndex(null);
    }, 400);
  };

  // Calculates dynamic accordion offset, neighbor scale reduction, and focal elevation
  const getCardLayout = (idx: number) => {
    const isHovered = hoveredIndex === idx;

    let outerTranslateX = 0;
    let innerTranslateY = 0;
    let scale = 1.0;
    const zIndex = idx + 10;

    if (hoveredIndex !== null) {
      const delta = idx - hoveredIndex;

      if (delta === 0) {
        outerTranslateX = 0;
        innerTranslateY = -28;
        scale = 1.12;
      } else if (delta === -1) {
        outerTranslateX = -110;
        scale = 0.92;
      } else if (delta === 1) {
        outerTranslateX = 110;
        scale = 0.92;
      } else if (delta === -2) {
        outerTranslateX = -50;
        scale = 0.96;
      } else if (delta === 2) {
        outerTranslateX = 50;
        scale = 0.96;
      }
    }

    return {
      outerTranslateX,
      innerTranslateY,
      scale,
      zIndex,
      isHovered,
    };
  };

  return (
    <section className="w-full bg-gradient-to-b from-[#000000] via-[#000000] to-[#0d0e13] relative overflow-hidden select-none">
      {/* Subtle ambient lighting behind center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[350px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Edge gradient vignettes: Fades the marquee seamlessly into the dark background at screen borders */}
      <div className="absolute top-0 bottom-0 left-0 w-32 sm:w-52 bg-gradient-to-r from-black via-black/80 to-transparent z-30 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 sm:w-52 bg-gradient-to-l from-black via-black/80 to-transparent z-30 pointer-events-none" />

      {/* Seamless bottom gradient blend into ShowreelSection */}
      <div className="absolute bottom-0 inset-x-0 h-44 sm:h-60 bg-gradient-to-b from-transparent via-[#0d0e13]/60 to-[#0d0e13] pointer-events-none z-20" />

      {/* Stage Container with Drag Listeners */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
        className="shelf-stage w-full overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 relative group cursor-grab active:cursor-grabbing touch-pan-y select-none"
      >
        <div
          ref={trackRef}
          onDragStart={(e) => e.preventDefault()}
          draggable={false}
          className="flex items-center w-max will-change-transform select-none"
        >
          {marqueeVideos.map((project, idx) => {
            const cardKey = `${project.id}-${idx}`;
            const layout = getCardLayout(idx);

            const isGold = project.award?.rank === 'GOLD WINNER';
            const isSilver = project.award?.rank === 'SILVER WINNER';

            return (
              <div
                key={cardKey}
                ref={(el) => { cardRefs.current[idx] = el; }}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                onPointerDown={() => {
                  clickedProjectRef.current = project;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isMovedRef.current) {
                    onSelectProject(project);
                  }
                }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                data-cursor="drag"
                className="relative shrink-0 cursor-pointer -mr-[65px] sm:-mr-[85px] md:-mr-[100px] select-none"
                style={{
                  perspective: '1200px',
                  zIndex: layout.zIndex,
                  transform: `translate3d(${layout.outerTranslateX}px, 0, 0)`,
                  transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: 1,
                  WebkitUserDrag: 'none',
                } as React.CSSProperties}
              >
                {/* 
                  3D Curved Card Plane:
                  - Smooth cylindrical 3D arc (facing center of viewport)
                  - Dynamic edge scale reduction
                  - Dynamic award ring & shadow glow
                */}
                <div
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className={`relative w-[190px] sm:w-[220px] md:w-[245px] aspect-[9/15] rounded-2xl sm:rounded-3xl overflow-hidden bg-transparent border-0 outline-none will-change-transform select-none ${
                    isGold
                      ? 'ring-2 ring-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                      : isSilver
                      ? 'ring-2 ring-slate-300/80 shadow-[0_0_30px_rgba(203,213,225,0.4)]'
                      : ''
                  }`}
                  style={{
                    transform: `translate3d(0, calc(var(--curve-y, 0px) + ${layout.innerTranslateY}px), 0) scale(calc(var(--curve-scale, 1) * ${layout.scale})) rotateY(${layout.isHovered ? '0deg' : 'var(--curve-rot-y, 0deg)'}) rotateZ(${layout.isHovered ? '0deg' : 'var(--curve-rot-z, 0deg)'})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease',
                    WebkitUserDrag: 'none',
                    boxShadow: layout.isHovered
                      ? isGold 
                        ? '0 25px 50px -10px rgba(0, 0, 0, 0.75), 0 0 45px rgba(245, 158, 11, 0.55)' 
                        : isSilver
                        ? '0 25px 50px -10px rgba(0, 0, 0, 0.75), 0 0 45px rgba(203, 213, 225, 0.55)'
                        : '0 25px 50px -10px rgba(0, 0, 0, 0.75), 0 0 30px rgba(16, 185, 129, 0.25)'
                      : isGold
                        ? '0 12px 25px -8px rgba(245, 158, 11, 0.35)'
                        : isSilver
                        ? '0 12px 25px -8px rgba(203, 213, 225, 0.4)'
                        : '0 12px 25px -8px rgba(0, 0, 0, 0.55)',
                  } as React.CSSProperties}
                >
                  {/* Base Poster */}
                  <img
                    src={project.posterSrc}
                    alt={project.title}
                    loading="lazy"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full h-full object-cover pointer-events-none block rounded-2xl sm:rounded-3xl select-none"
                    style={{ WebkitUserDrag: 'none', userSelect: 'none' } as React.CSSProperties}
                  />

                  {/* High-Tech Gold Trophy Badge for Vinyl CGI (Icon Only, Top Left) */}
                  {isGold && (
                    <div 
                      title="Gold Award Winner"
                      className="absolute top-3 left-3 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#181206]/95 border border-amber-400/80 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center backdrop-blur-md"
                    >
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400/40 text-amber-400" />
                    </div>
                  )}

                  {/* High-Tech Silver Trophy Badge for Haar-Raah (Icon Only, Top Left) */}
                  {isSilver && (
                    <div 
                      title="Silver Award Winner"
                      className="absolute top-3 left-3 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#161d2a]/95 border border-slate-300/80 text-slate-200 shadow-[0_0_15px_rgba(203,213,225,0.4)] flex items-center justify-center backdrop-blur-md"
                    >
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-300/40 text-slate-200" />
                    </div>
                  )}

                  {/* Live Video Mount on Hover (Plays commercial video or making-of / breakdown video) */}
                  {videoMountIndex === idx && Boolean(project.videoSrc || project.makingOfVideoSrc) && (
                    <video
                      ref={(el) => {
                        if (el) {
                          el.muted = true;
                          el.defaultMuted = true;
                          el.play().catch(() => {});
                        }
                      }}
                      src={project.videoSrc || project.makingOfVideoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover pointer-events-none block rounded-2xl sm:rounded-3xl transition-opacity duration-300 ${
                        hoveredIndex === idx ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {/* Light glass sheen highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10 pointer-events-none rounded-2xl sm:rounded-3xl" />

                  {/* Information Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 sm:p-5 flex flex-col justify-between text-white transition-opacity duration-300 ${
                      layout.isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
                        isGold || isSilver ? 'ml-8 sm:ml-9 ' : ''
                      }${
                        isGold
                          ? 'bg-[#1e1708]/90 text-amber-300 border-amber-400/50'
                          : isSilver
                          ? 'bg-[#161d2a]/90 text-slate-200 border-slate-300/60'
                          : 'bg-black/80 text-emerald-400 border-white/15'
                      }`}>
                        {project.client}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {project.aspectRatio}
                      </span>
                    </div>

                    <div>
                      {project.award && (
                        <div className={`text-[10px] font-mono font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${
                          isGold ? 'text-amber-300' : 'text-slate-200'
                        }`}>
                          <Trophy className={`w-3 h-3 ${isGold ? 'text-amber-400' : 'text-slate-300'}`} />
                          <span>{project.award.rank} &bull; {project.award.subCategory || project.award.year}</span>
                        </div>
                      )}
                      <h4 className="text-sm sm:text-base font-semibold tracking-tight text-white line-clamp-2 mb-1 leading-snug">
                        {project.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mb-3 font-mono">
                        {project.role}
                      </p>

                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project);
                        }}
                        className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none hover:opacity-80 transition-opacity ${
                          project.award ? 'text-amber-300' : 'text-emerald-400'
                        }`}
                      >
                        {project.isStill && !project.makingOfVideoSrc ? (
                          <>
                            <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>View Artwork</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{project.makingOfVideoSrc && !project.videoSrc ? 'Watch Breakdown' : 'Watch Video'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .shelf-stage, .shelf-stage * {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>
    </section>
  );
};
