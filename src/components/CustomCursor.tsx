import React, { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'hover' | 'play' | 'drag' | 'view' | 'text';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const [variant, setVariant] = useState<CursorVariant>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  // High precision mouse coordinates (1:1 hardware tracked)
  const mousePos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const variantRef = useRef<CursorVariant>('default');

  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Enable on desktop/laptop mouse & trackpad environments (excluding touch-only coarse pointers)
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return;

    setIsEnabled(true);
    document.body.classList.add('custom-cursor-enabled');

    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      // Instant 1:1 hardware translation for inner dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Context detection
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const playTarget = target.closest('[data-cursor="play"], #showreel video, #showreel .group');
      const dragTarget = target.closest('[data-cursor="drag"], #shelf, .folio-card');
      const viewTarget = target.closest('[data-cursor="view"], .work-card, #works article');
      const textTarget = target.closest('input, textarea');
      const clickableTarget = target.closest('button, a, [role="button"], select, .cursor-pointer');

      let nextVariant: CursorVariant = 'default';
      if (playTarget) {
        nextVariant = 'play';
      } else if (dragTarget) {
        nextVariant = 'drag';
      } else if (viewTarget) {
        nextVariant = 'view';
      } else if (textTarget) {
        nextVariant = 'text';
      } else if (clickableTarget) {
        nextVariant = 'hover';
      }

      if (nextVariant !== variantRef.current) {
        variantRef.current = nextVariant;
        setVariant(nextVariant);
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    // RAF loop for buttery smooth follower ring lerp damping
    const render = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      ringPos.current.x += (targetX - ringPos.current.x) * 0.18;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, []);

  if (!isEnabled) return null;

  // Geometry and styling configuration based on variant
  let ringSize = 34;
  let ringClasses = "border-white/35 bg-white/[0.02]";
  let label = "";

  switch (variant) {
    case 'play':
      ringSize = 76;
      ringClasses = "border-emerald-400/80 bg-emerald-950/70 shadow-[0_0_35px_rgba(52,211,153,0.35)] backdrop-blur-sm";
      label = "PLAY";
      break;
    case 'drag':
      ringSize = 72;
      ringClasses = "border-white/60 bg-black/75 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-sm";
      label = "DRAG";
      break;
    case 'view':
      ringSize = 68;
      ringClasses = "border-emerald-400/60 bg-black/75 shadow-[0_0_25px_rgba(52,211,153,0.25)] backdrop-blur-sm";
      label = "VIEW";
      break;
    case 'hover':
      ringSize = 52;
      ringClasses = "border-emerald-400/70 bg-emerald-400/[0.08] shadow-[0_0_20px_rgba(52,211,153,0.25)]";
      break;
    case 'text':
      ringSize = 24;
      ringClasses = "border-white/40 bg-transparent";
      break;
    default:
      ringSize = 34;
      ringClasses = "border-white/35 bg-white/[0.02]";
      break;
  }

  const scale = isMouseDown ? 0.82 : 1;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 1. Precision Reticle Core: Zero-latency 1:1 hardware tracking */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[3px] -mt-[3px] will-change-transform z-20 pointer-events-none"
      >
        <span
          className={`block rounded-full transition-all duration-200 ${
            variant === 'play' || variant === 'view' || variant === 'drag'
              ? 'opacity-0 scale-0'
              : variant === 'hover'
              ? 'w-2 h-2 -ml-[1px] -mt-[1px] bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,1)]'
              : 'w-1.5 h-1.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
          }`}
        />
      </div>

      {/* 2. 3D Viewport / Camera Reticle Follower Ring: Silky RAF lerp */}
      <div
        ref={ringRef}
        style={{
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          marginLeft: `-${ringSize / 2}px`,
          marginTop: `-${ringSize / 2}px`,
          transform: `scale(${scale})`,
          transition:
            'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), height 0.28s cubic-bezier(0.16, 1, 0.3, 1), margin 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
        }}
        className={`fixed top-0 left-0 rounded-full border will-change-transform flex items-center justify-center pointer-events-none z-10 ${ringClasses}`}
      >
        {/* 3D Viewport Crosshair Ticks: 12, 3, 6, 9 o'clock */}
        {variant === 'default' && (
          <>
            <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[1px] h-[5px] bg-white/50" />
            <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[1px] h-[5px] bg-white/50" />
            <span className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[5px] h-[1px] bg-white/50" />
            <span className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[5px] h-[1px] bg-white/50" />
          </>
        )}

        {/* Dynamic Context Label in Funnel Display */}
        {label && (
          <span className="font-funnel tracking-widest text-[10px] font-bold uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] select-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
