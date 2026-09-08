import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Maximize2, Smartphone, Monitor, Trophy, Dices } from 'lucide-react';
import { Project, ALL_PROJECTS, getWorkPriorityTier } from '../data/projects';

interface WorksGalleryProps {
  onSelectProject: (project: Project) => void;
}

type CategoryFilter = 'All' | 'CGI' | 'AI' | 'Motion Graphics' | 'Match Move' | '3D Stills';

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: "All Works", value: "All" },
  { label: "CGI", value: "CGI" },
  { label: "AI", value: "AI" },
  { label: "Motion Graphics", value: "Motion Graphics" },
  { label: "Match Move", value: "Match Move" },
  { label: "3D Stills", value: "3D Stills" }
];

export const WorksGallery: React.FC<WorksGalleryProps> = ({ onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [numCols, setNumCols] = useState<number>(3);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [shuffledOrderMap, setShuffledOrderMap] = useState<Record<string, number>>({});

  React.useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) setNumCols(1);
      else if (w < 1024) setNumCols(2);
      else setNumCols(3);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const handleShuffle = () => {
    setIsRolling(true);
    setTimeout(() => setIsRolling(false), 600);

    const newMap: Record<string, number> = {};
    const keys = ALL_PROJECTS.map(p => p.id);
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    keys.forEach((id, index) => {
      newMap[id] = index;
    });
    setShuffledOrderMap(newMap);
    setShuffleSeed(prev => prev + 1);
  };

  const filteredProjects = React.useMemo(() => {
    let list = ALL_PROJECTS;

    if (activeCategory !== 'All') {
      list = ALL_PROJECTS.filter((p) => {
        if (p.targetCategory) {
          return p.targetCategory === activeCategory;
        }
        if (activeCategory === 'CGI') {
          return !p.isStill && (p.category === 'CGI & 3D Ads' || p.category === 'Product & CGI' || p.category === 'Brand Film');
        }
        if (activeCategory === 'AI') {
          return (p.folder || '').toLowerCase().includes('oiai') || (p.client || '').toLowerCase().includes('oiai') || (p.tags || []).join(' ').toLowerCase().includes('ai');
        }
        if (activeCategory === 'Match Move') {
          return (p.folder || '').toLowerCase().includes('match move') || (p.tags || []).join(' ').toLowerCase().includes('matchmove');
        }
        if (activeCategory === 'Motion Graphics') {
          return p.category === 'Motion & Reels' || p.category === 'Brand Film';
        }
        if (activeCategory === '3D Stills') {
          return p.isStill === true || p.category === '3D Stills & Art';
        }
        return true;
      });
    }

    if (shuffleSeed === 0) {
      return [...list].sort((a, b) => getWorkPriorityTier(a) - getWorkPriorityTier(b));
    }

    // Shuffle WITHIN priority tiers (Top: Primary CGI -> Middle: Motion & AI -> Bottom: All Other Stuff)
    return [...list].sort((a, b) => {
      const tierA = getWorkPriorityTier(a);
      const tierB = getWorkPriorityTier(b);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      return (shuffledOrderMap[a.id] ?? 0) - (shuffledOrderMap[b.id] ?? 0);
    });
  }, [activeCategory, shuffleSeed, shuffledOrderMap]);

  // Distribute projects round-robin across columns for Left-to-Right reading flow with ZERO vertical gaps
  const columns: { project: Project; originalIndex: number }[][] = Array.from({ length: numCols }, () => []);
  filteredProjects.forEach((project, index) => {
    columns[index % numCols].push({ project, originalIndex: index });
  });

  return (
    <section id="works" className="w-full max-w-7xl mx-auto px-6 py-20 sm:py-28 bg-[#090a0d]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2">
            Selected Commercial & Creative Vault &bull; 2023–2026
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white">
            The Work Vault
          </h2>
        </div>

        {/* Filter Pills & Roll Dice Shuffle Button */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setShuffleSeed(0); // Reset shuffle order to default when selecting any category pill
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/20"
                    : "bg-[#13141b] text-neutral-400 hover:text-white border border-white/10 hover:bg-[#1a1b24]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Rolling Dice Random Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="px-3.5 py-2 rounded-full bg-[#13141b] hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-lg group relative ml-1"
            title="Roll Dice to Shuffle Vault Grid"
          >
            <motion.div
              animate={{ rotate: isRolling ? [0, 360, 720] : 0, scale: isRolling ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Dices className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </motion.div>
            <span className="text-xs sm:text-sm font-mono font-medium">
              Shuffle
            </span>
          </button>
        </div>
      </div>

      {/* Left-to-Right Masonry Layout: Zero vertical blank space */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {columns.map((colProjects, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-6 sm:gap-8 w-full min-w-0">
            {colProjects.map(({ project, originalIndex }) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={originalIndex}
                isHovered={hoveredId === project.id}
                onHover={() => setHoveredId(project.id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => onSelectProject(project)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

interface ProjectCardProps {
  project: Project;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isHovered,
  onHover,
  onLeave,
  onClick,
}) => {
  const [cardProgress, setCardProgress] = useState(0);
  const cardVideoRef = useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    let animId: number;
    const updateCardProgress = () => {
      if (cardVideoRef.current && !cardVideoRef.current.paused) {
        if (cardVideoRef.current.duration) {
          setCardProgress((cardVideoRef.current.currentTime / cardVideoRef.current.duration) * 100);
        }
      }
      animId = requestAnimationFrame(updateCardProgress);
    };
    if (isHovered && !project.isStill && project.videoSrc) {
      animId = requestAnimationFrame(updateCardProgress);
    }
    return () => cancelAnimationFrame(animId);
  }, [isHovered, project]);

  // Compute aspect ratio CSS value
  const aspectRatioStyle = project.width && project.height
    ? `${project.width} / ${project.height}`
    : project.isVertical ? '9 / 16' : '16 / 9';

  const isGold = project.award?.rank === 'GOLD WINNER';
  const isSilver = project.award?.rank === 'SILVER WINNER';
  const isAwarded = !!project.award;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3 },
        y: { duration: 0.3, delay: Math.min(index * 0.03, 0.2) }
      }}
      onMouseEnter={onHover}
      onMouseLeave={() => {
        onLeave();
        setCardProgress(0);
      }}
      onClick={onClick}
      data-cursor="view"
      className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 cursor-pointer transform-gpu will-change-transform ${
        isGold
          ? 'bg-gradient-to-b from-[#1a160b] via-[#111217] to-[#111217] border-2 border-amber-400/60 hover:border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.22)] hover:shadow-[0_0_40px_rgba(245,158,11,0.38)]'
          : isSilver
          ? 'bg-gradient-to-b from-[#161c28] via-[#111217] to-[#111217] border-2 border-slate-300/70 hover:border-slate-100 shadow-[0_0_25px_rgba(203,213,225,0.25)] hover:shadow-[0_0_40px_rgba(203,213,225,0.42)]'
          : 'bg-[#111217] border border-white/[0.08] hover:border-emerald-500/40'
      }`}
    >
      {/* Media container: Exact mathematical aspect ratio */}
      <div 
        className="relative w-full bg-[#07080a] overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: aspectRatioStyle }}
      >
        {/* Poster Image */}
        <img
          src={project.posterSrc}
          alt={project.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isHovered && !project.isStill ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Dynamic Video Mount on Hover only (zero background decoders) */}
        {isHovered && !project.isStill && project.videoSrc && (
          <video
            ref={(el) => {
              cardVideoRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                const targetSpeed = project.playbackRate || ((project.id === 'proj-2' || project.title.toLowerCase().includes('haar')) ? 3.0 : 1.0);
                el.playbackRate = targetSpeed;
                el.play().catch(() => {});
              }
            }}
            src={project.videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Aspect Ratio & Client Tag Pills */}
        <div className={`absolute top-3 z-10 flex items-center gap-1.5 ${isGold || isSilver ? 'left-13' : 'left-3'}`}>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-black/75 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
            {project.isVertical ? (
              <Smartphone className="w-3 h-3 text-emerald-400" />
            ) : (
              <Monitor className="w-3 h-3 text-sky-400" />
            )}
            <span>{project.aspectRatio}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 backdrop-blur-md text-white border border-white/10">
            {project.client}
          </span>
        </div>

        {/* Award Top Winner Icon Badge (Clickable link to Official Award Portal, Top Left) */}
        {isGold && (
          project.award?.link ? (
            <a 
              href={project.award.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 z-30 w-8 h-8 rounded-full bg-[#181206]/95 border-2 border-amber-400 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.6)] flex items-center justify-center backdrop-blur-md transition-transform duration-300 hover:scale-110 cursor-pointer"
              title="Click to open Official Award Website (ACEF Winners 2026)"
            >
              <Trophy className="w-4 h-4 fill-amber-400/50 text-amber-400" />
            </a>
          ) : (
            <div 
              className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-[#181206]/95 border-2 border-amber-400 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.6)] flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
              title="Gold Award Winner"
            >
              <Trophy className="w-4 h-4 fill-amber-400/50 text-amber-400" />
            </div>
          )
        )}
        {isSilver && (
          project.award?.link ? (
            <a 
              href={project.award.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 left-3 z-30 w-8 h-8 rounded-full bg-[#0f141d]/95 border-2 border-slate-300 text-slate-200 shadow-[0_0_18px_rgba(203,213,225,0.5)] flex items-center justify-center backdrop-blur-md transition-transform duration-300 hover:scale-110 cursor-pointer"
              title="Click to open Official Award Website (afaqs! Excellence Awards 2025)"
            >
              <Trophy className="w-4 h-4 fill-slate-300/50 text-slate-200" />
            </a>
          ) : (
            <div 
              className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-[#0f141d]/95 border-2 border-slate-300 text-slate-200 shadow-[0_0_18px_rgba(203,213,225,0.5)] flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
              title="Silver Award Winner"
            >
              <Trophy className="w-4 h-4 fill-slate-300/50 text-slate-200" />
            </div>
          )
        )}

        {/* Center Hover Icon: Play for videos, Maximize2 Fullscreen for images */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 opacity-0 group-hover:opacity-100 ${
            isGold ? 'bg-amber-400 text-black' : isSilver ? 'bg-slate-200 text-black' : 'bg-white text-black'
          }`}>
            {project.isStill ? (
              <Maximize2 className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Duration badge if video */}
        {project.duration && !isAwarded && (
          <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 backdrop-blur-sm text-neutral-300 border border-white/10">
            {project.duration}s
          </div>
        )}
      </div>

      {/* Card Info: Tightly hugs content without stretching */}
      <div className={`p-4 sm:p-5 flex flex-col ${
        isGold ? 'bg-gradient-to-b from-[#1a160b] to-[#111217]' : isSilver ? 'bg-gradient-to-b from-[#161c28] to-[#111217]' : 'bg-[#111217]'
      }`}>
        
        {/* Award Highlight Banner */}
        {project.award && (
          <div className={`mb-3 px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            isGold
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-slate-400/15 border-slate-400/30 text-slate-200'
          }`}>
            <Trophy className={`w-4 h-4 shrink-0 ${isGold ? 'text-amber-400' : 'text-slate-300'}`} />
            <span className="truncate font-semibold tracking-wide">
              {project.award.rank} &bull; {project.award.subCategory}
            </span>
          </div>
        )}

        <div className="mb-1">
          <h3 className={`text-base sm:text-lg font-medium tracking-tight transition-colors ${
            isGold ? 'text-amber-200 group-hover:text-amber-300' : isSilver ? 'text-slate-100 group-hover:text-white' : 'text-white group-hover:text-emerald-400'
          }`}>
            {project.title}
          </h3>
        </div>

        <p className="text-xs text-neutral-400 line-clamp-1 mb-3">
          {project.role}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.06]">
          {project.tools.slice(0, 3).map((tool) => (
            <span
              key={tool}
              className={`text-[11px] px-2 py-0.5 rounded-md border ${
                isGold 
                  ? 'bg-amber-400/10 border-amber-400/20 text-amber-200' 
                  : isSilver
                  ? 'bg-slate-300/10 border-slate-300/20 text-slate-200'
                  : 'bg-white/[0.04] border-white/[0.08] text-neutral-300'
              }`}
            >
              {tool}
            </span>
          ))}
          {project.tools.length > 3 && (
            <span className="text-[10px] text-neutral-500 ml-1">
              +{project.tools.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

