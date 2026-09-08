import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  Sliders, 
  Award, 
  Zap, 
  Scan, 
  Maximize2, 
  X, 
  Check,
  Cpu,
  Box,
  Palette,
  Gem,
  Scissors,
  Flame,
  Film,
  Target,
  Network
} from 'lucide-react';
import { PROFILE_INFO } from '../data/projects';

type RenderMode = 'rendered' | 'clay' | 'wire';

interface SoftwareDetails {
  name: string;
  category: string;
  level: string;
  description: string;
  plugins: string[];
  workflowHighlights: string[];
}

const SOFTWARE_DETAILS: Record<string, SoftwareDetails> = {
  Blender: {
    name: 'Blender',
    category: '3D Modeling & Rendering',
    level: '3D Modeling & Rendering',
    description: 'Primary 3D suite used for hard-surface modeling, procedural shading, Cycles rendering, compositing, and CGI production.',
    plugins: ['Cycles', 'GeoNodes', 'HardOps', 'BoxCutter'],
    workflowHighlights: ['3D scene lighting setups', 'Procedural shader node networks', 'Camera tracking & matchmove']
  },
  'Substance Painter': {
    name: 'Substance Painter',
    category: 'PBR & Texturing',
    level: 'PBR & Texturing',
    description: '3D texturing suite for PBR material authoring, realistic surface aging, edge wear, and custom smart materials.',
    plugins: ['Smart Materials', 'Iray Render', 'Anchor Points'],
    workflowHighlights: ['PBR texture maps', 'Material aging & wear', 'Metallic & roughness maps']
  },
  ZBrush: {
    name: 'ZBrush',
    category: 'Digital Sculpting',
    level: 'Digital Sculpting',
    description: 'Digital sculpting software for high-poly character models, organic detailing, and displacement map baking.',
    plugins: ['DynaMesh', 'ZRemesher', 'Decimation Master'],
    workflowHighlights: ['High-poly sculpts', 'Displacement baking', 'Asset detailing']
  },
  'Marvelous Designer': {
    name: 'Marvelous Designer',
    category: 'Cloth Simulation',
    level: 'Cloth Simulation',
    description: '3D garment patterning and dynamic cloth simulation software used for apparel and fashion motion visuals.',
    plugins: ['Pattern Drafting', 'Fabric Physics Engine'],
    workflowHighlights: ['Fabric drapes', 'Dynamic cloth motion', 'Garment CGI']
  },
  'JangaFX Suite': {
    name: 'JangaFX Suite',
    category: 'Realtime FX Simulation',
    level: 'Realtime FX',
    description: 'Real-time volumetric simulation suite. Used for EmberGen (fire/smoke VFX), LiquiGen (fluids), and GeoGen (procedural terrain generation).',
    plugins: ['EmberGen', 'LiquiGen', 'GeoGen'],
    workflowHighlights: ['Real-time fire & smoke VFX', 'Fluid dynamic simulations', 'Procedural terrain generation']
  },
  'Adobe Suite': {
    name: 'Adobe Suite',
    category: 'Compositing & Post',
    level: 'Compositing & Post',
    description: 'Core design and post-production stack: Photoshop (concept design), After Effects (compositing & motion graphics), Illustrator (vector graphics), and Premiere Pro (video editing).',
    plugins: ['After Effects', 'Photoshop', 'Illustrator', 'Premiere Pro'],
    workflowHighlights: ['VFX & multi-pass compositing', 'Motion graphics & video editing', 'Vector graphics & poster design']
  },
  Syntheyes: {
    name: 'Syntheyes',
    category: '3D Camera Tracking',
    level: '3D Camera Tracking',
    description: '3D camera tracking suite used for camera solves, object tracking, lens distortion correction, and live-action VFX matchmove alignment.',
    plugins: ['Supervised Tracking', 'Automatic Tracker', 'Object Solver'],
    workflowHighlights: ['Live-action camera solves', 'Object & vehicle tracking', 'Ground plane export to Blender']
  },
  ComfyUI: {
    name: 'ComfyUI',
    category: 'AI-Assisted Workflows',
    level: 'AI Node Workflows',
    description: 'Node-based AI generation engine used with custom node workflows for targeted image, video, and texture asset generation.',
    plugins: ['Custom Node Pipelines', 'ControlNet', 'AnimateDiff', 'IP-Adapter'],
    workflowHighlights: ['Custom node workflow design', 'Controlled image/video generation', 'AI texture & asset synthesis']
  },
  'Freepik AI Suite': {
    name: 'Freepik AI Suite',
    category: 'AI Production',
    level: 'AI Production',
    description: 'Generative AI toolset used for rapid image generation, upscaling, retouching, and daily creative AI tasks.',
    plugins: ['AI Upscaler', 'Flux Generators', 'Relight & Retouch'],
    workflowHighlights: ['Daily creative AI production', 'High-res image upscaling', 'Concept visual acceleration']
  }
};

const renderSoftwareIcon = (name: string) => {
  switch (name) {
    case 'Blender':
      return <Box className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'Substance Painter':
      return <Palette className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'ZBrush':
      return <Gem className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'Marvelous Designer':
      return <Scissors className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'JangaFX Suite':
      return <Flame className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'Adobe Suite':
      return <Film className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'Syntheyes':
      return <Target className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'ComfyUI':
      return <Network className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'Freepik AI Suite':
      return <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />;
    default:
      return <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />;
  }
};

interface TypewriterTextProps {
  plainText: string;
  triggerKey: number;
  speed?: number;
  delay?: number;
  richJsx: React.ReactNode;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  plainText,
  triggerKey,
  speed = 12,
  delay = 0,
  richJsx
}) => {
  const [mode, setMode] = useState<'idle' | 'waiting' | 'typing' | 'done'>('idle');
  const [charCount, setCharCount] = useState<number>(plainText.length);

  useEffect(() => {
    if (triggerKey === 0) {
      setMode('idle');
      setCharCount(plainText.length);
      return;
    }

    setMode('waiting');
    setCharCount(0);

    const timer = setTimeout(() => {
      setMode('typing');
      let count = 0;
      const interval = setInterval(() => {
        if (count < plainText.length) {
          count += 1;
          setCharCount(count);
        } else {
          setMode('done');
          clearInterval(interval);
        }
      }, speed);
    }, delay);

    return () => clearTimeout(timer);
  }, [triggerKey, plainText, speed, delay]);

  if (mode === 'idle' || mode === 'done') {
    return <>{richJsx}</>;
  }

  if (mode === 'waiting') {
    return <span className="opacity-0 font-mono select-none">.</span>;
  }

  return (
    <span className="font-mono text-emerald-300/90 tracking-wide leading-relaxed">
      {plainText.slice(0, charCount)}
      <span className="inline-block w-2.5 h-4.5 ml-1 bg-emerald-400 animate-pulse align-middle font-mono text-emerald-400">▋</span>
    </span>
  );
};

export const AboutSection: React.FC = () => {
  const [activeRenderMode, setActiveRenderMode] = useState<RenderMode>('rendered');
  const [isScanning, setIsScanning] = useState(false);
  const [sampleCount, setSampleCount] = useState(4096);
  const [hoveredSoftware, setHoveredSoftware] = useState<string | null>(null);
  const [selectedSoftwareModal, setSelectedSoftwareModal] = useState<SoftwareDetails | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeKeyframe, setActiveKeyframe] = useState<number>(0);

  const [scanMessage, setScanMessage] = useState<{ title: string; subtitle: string; stage: string } | null>(null);

  const [scanReportKey, setScanReportKey] = useState<number>(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // Parallax tilt for the portrait card
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMovePortrait = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
  };

  const handleMouseLeavePortrait = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Trigger interactive 3D Mesh Laser Scan Sequence
  const handleTriggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setSampleCount(128);

    // Stage 1: Clay Mode (Geometry Check)
    setActiveRenderMode('clay');
    setScanMessage({
      title: 'SCANNING MESH GEOMETRY',
      subtitle: '✓ GOOD MODEL: Solid Form & Base Geometry',
      stage: '1/3 GEOMETRY'
    });

    // Stage 2: Wireframe Mode (Topology Check)
    setTimeout(() => {
      setActiveRenderMode('wire');
      setScanMessage({
        title: 'ANALYZING TOPOLOGY',
        subtitle: '✓ CLEAN TOPOLOGY: Optimized Quad Edge Loops',
        stage: '2/3 TOPOLOGY'
      });
    }, 2200);

    // Stage 3: Rendered Mode (PBR Shading & Lighting) & Trigger Telemetry Report Print
    setTimeout(() => {
      setActiveRenderMode('rendered');
      setSampleCount(1024);
      setScanMessage({
        title: 'FINALIZING CYCLES RENDER',
        subtitle: '✓ PBR LIGHTING & TEXTURES COMPILED',
        stage: '3/3 RENDERING'
      });
      // Re-animate left bio & metrics column as verified scan report!
      setScanReportKey((prev) => prev + 1);
      setIsGeneratingReport(true);
    }, 4400);

    // Stage 4: Completion Notice
    setTimeout(() => {
      setScanMessage({
        title: '3D MESH SCAN COMPLETE',
        subtitle: '✓ VERIFIED: Production-Grade Model & Clean Topology',
        stage: 'COMPLETE'
      });
    }, 6200);

    // Reset scan active state & scanline beam
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage(null);
      setIsGeneratingReport(false);
    }, 8200);
  };

  // Progressive sample count ticking animation during scan or mode switch
  useEffect(() => {
    if (sampleCount < 4096) {
      const interval = setInterval(() => {
        setSampleCount((prev) => Math.min(4096, prev + 512));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [sampleCount]);

  return (
    <section id="about" className="relative w-full max-w-7xl mx-auto px-6 py-24 sm:py-32 border-t border-white/10 bg-[#090a0d] overflow-hidden select-none">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-purple-500/08 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Sub-Header */}
      <div className="relative z-10 mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ABOUT ME</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
            Senior Visualizer, Motion Graphic Artist <span className="bg-gradient-to-r from-white via-neutral-200 to-emerald-400 bg-clip-text text-transparent font-medium">& 3D Generalist</span>
          </h2>
        </div>
      </div>

      {/* Main Grid: Bio + Interactive 3D Viewport Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-28 relative z-10">
        
        {/* Left Column: Narrative & Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-center relative p-2 sm:p-4">
          
          {/* Laser Telemetry Scanline */}
          <AnimatePresence>
            {isGeneratingReport && (
              <>
                <motion.div
                  key="report-laser-scanline"
                  initial={{ top: '0%', opacity: 1 }}
                  animate={{ top: '100%', opacity: [1, 1, 0] }}
                  transition={{ duration: 3.8, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_25px_rgba(52,211,153,1),0_0_50px_rgba(52,211,153,0.8)] z-40 pointer-events-none rounded-full"
                />
                <div className="absolute inset-0 bg-emerald-500/05 pointer-events-none z-30 animate-pulse rounded-3xl" />
              </>
            )}
          </AnimatePresence>

          {/* Verified Scan Report HUD Header Tag */}
          <AnimatePresence>
            {scanReportKey > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="inline-flex items-center justify-between px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-6 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.2)]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold tracking-wider uppercase text-emerald-300">TELEMETRY SCAN REPORT VERIFIED</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-black/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30 font-mono">
                  PROFILE VERIFIED
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Paragraph 1: Current Work & Experience */}
          <p className="text-lg sm:text-xl text-neutral-200 leading-relaxed font-light mb-6 min-h-[70px]">
            <TypewriterText
              plainText="I am Sahil Vishwakarma, a Senior Visualizer, Motion Graphic Artist and 3D Generalist based in Dombivli, India, with 4+ years of professional experience. I currently work across 3D CGI, motion graphics, visualization, compositing and AI-assisted content at Oktobuzz. I've worked on visual content and CGI projects for brands including Westside, Vithobha Healthcare, ACCA, OIAI, A&H and Xeno's Play Space, along with book promotion projects for Chetan Bhagat and Amish Tripathi."
              triggerKey={scanReportKey}
              speed={5}
              delay={0}
              richJsx={
                <>
                  I am <strong className="text-white font-semibold underline decoration-emerald-500/50 decoration-2 underline-offset-4">Sahil Vishwakarma</strong>, a Senior Visualizer, Motion Graphic Artist and 3D Generalist based in Dombivli, India, with 4+ years of professional experience.
                  <br /><br />
                  I currently work across 3D CGI, motion graphics, visualization, compositing and AI-assisted content at <strong className="text-white font-semibold">Oktobuzz</strong>. I've worked on visual content and CGI projects for brands including <strong className="text-emerald-300 font-medium">Westside</strong>, Vithobha Healthcare, ACCA, OIAI, A&H and Xeno's Play Space, along with book promotion projects for Chetan Bhagat and Amish Tripathi.
                </>
              }
            />
          </p>

          {/* Paragraph 2: Career Foundation & Transition to 3D */}
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 min-h-[70px]">
            <TypewriterText
              plainText="I started my career in 2022 as a Graphic Designer at PentableU in BKC. While working there, I became interested in 3D and started learning Blender on my own, eventually moving into 3D and CGI professionally."
              triggerKey={scanReportKey}
              speed={5}
              delay={1500}
              richJsx={
                <>
                  I started my career in 2022 as a Graphic Designer at <strong className="text-white font-medium">PentableU in BKC</strong>. While working there, I became interested in 3D and started learning Blender on my own, eventually moving into 3D and CGI professionally.
                </>
              }
            />
          </p>

          {/* Selected Clients & Projects Dock */}
          <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                SELECTED CLIENTS & PROJECTS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                CLIENTS & BRANDS
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {[
                { name: 'Westside', desc: 'Retail & CGI Projects', color: 'border-amber-500/40 text-amber-300', impact: 'CGI projects, social trend concepts and brand-aligned creative visuals' },
                { name: 'Vithobha Healthcare', desc: 'Healthcare CGI', color: 'border-purple-500/40 text-purple-300', impact: '3D product renders and commercial promotion' },
                { name: 'ACCA', desc: 'Motion Graphics', color: 'border-rose-500/40 text-rose-300', impact: 'Educational campaign motion graphics' },
                { name: 'OIAI', desc: '3D Visualization', color: 'border-blue-500/40 text-blue-300', impact: '3D visualization, brand film and compositing' },
                { name: 'A&H', desc: 'Brand Film', color: 'border-cyan-500/40 text-cyan-300', impact: '3D motion and brand visual content' },
                { name: "Xeno's Play Space", desc: '3D CGI', color: 'border-emerald-500/40 text-emerald-300', impact: '3D CGI and visual graphics' },
                { name: 'Chetan Bhagat', desc: 'Book Promotion', color: 'border-teal-500/40 text-teal-300', impact: 'Book promotion project visuals' },
                { name: 'Amish Tripathi', desc: 'Book Promotion', color: 'border-orange-500/40 text-orange-300', impact: 'Vertical motion graphics and book promotion campaigns' }
              ].map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => setSelectedClient(selectedClient === brand.name ? null : brand.name)}
                  className={`px-4 py-2 rounded-xl bg-black/60 border ${brand.color} shadow-lg backdrop-blur-md flex items-center gap-2 hover:scale-105 transition-all cursor-pointer ${
                    selectedClient === brand.name ? 'ring-2 ring-emerald-400 bg-white/10' : ''
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-sm font-medium text-white">{brand.name}</span>
                  <span className="text-[10px] font-mono text-neutral-400">({brand.desc})</span>
                </button>
              ))}
            </div>

            {/* Client Detail Popup Reveal */}
            <AnimatePresence>
              {selectedClient && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-neutral-300 flex items-center justify-between bg-black/40 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span><strong>{selectedClient}:</strong> {[
                      { name: 'Westside', impact: 'CGI projects, social trend concepts and brand-aligned creative visuals' },
                      { name: 'Vithobha Healthcare', impact: '3D product renders and commercial promotion' },
                      { name: 'ACCA', impact: 'Educational campaign motion graphics' },
                      { name: 'OIAI', impact: '3D visualization, brand film and compositing' },
                      { name: 'A&H', impact: '3D motion and brand visual content' },
                      { name: "Xeno's Play Space", impact: '3D CGI and visual graphics' },
                      { name: 'Chetan Bhagat', impact: 'Book promotion project visuals' },
                      { name: 'Amish Tripathi', impact: 'Vertical motion graphics and book promotion campaigns' }
                    ].find(b => b.name === selectedClient)?.impact}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="text-neutral-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authentic Real Metrics */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/10 mb-10">
            <motion.div 
              key={`m1-${scanReportKey}`}
              initial={scanReportKey > 0 ? { scale: 0.85, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 transition-colors group relative overflow-hidden"
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white block mb-1 font-mono group-hover:scale-105 transition-transform">
                4<span className="text-emerald-400 font-semibold">+</span>
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono block">
                Years Experience
              </span>
            </motion.div>
            
            <motion.div 
              key={`m2-${scanReportKey}`}
              initial={scanReportKey > 0 ? { scale: 0.85, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 transition-colors group relative overflow-hidden"
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white block mb-1 font-mono group-hover:scale-105 transition-transform">
                2
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono block">
                Studios
              </span>
            </motion.div>

            <motion.div 
              key={`m3-${scanReportKey}`}
              initial={scanReportKey > 0 ? { scale: 0.85, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 transition-colors group relative overflow-hidden"
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-cyan-300 block mb-1 font-mono group-hover:scale-105 transition-transform">
                BMM
              </span>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono block">
                University of Mumbai
              </span>
            </motion.div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={PROFILE_INFO.resumePath}
              target="_blank"
              rel="noreferrer"
              className="group relative px-7 py-3.5 rounded-full bg-white text-black text-sm font-semibold tracking-wide hover:bg-neutral-100 transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] overflow-hidden"
            >
              <Download className="w-4 h-4 text-black group-hover:-translate-y-0.5 transition-transform" />
              <span>Download Full CV (PDF)</span>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </a>

            <a
              href={`mailto:${PROFILE_INFO.email}`}
              className="px-7 py-3.5 rounded-full bg-[#12141a] text-white border border-white/20 text-sm font-medium hover:bg-[#1a1d26] hover:border-emerald-400/50 transition-all flex items-center gap-2.5 group shadow-lg"
            >
              <span>Email Sahil</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right Column: 3D Viewport HUD Studio Profile Card */}
        <div className="lg:col-span-5">
          <motion.div
            onMouseMove={handleMouseMovePortrait}
            onMouseLeave={handleMouseLeavePortrait}
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-[#0d0e12] p-4 sm:p-5 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden group"
          >
            {/* Viewport Top HUD Overlay Bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/80 rounded-2xl border border-white/10 mb-3 text-[11px] font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-semibold uppercase">CAM_01</span>
              </div>
              <span className="text-neutral-500 hidden sm:inline">3840x2160 &bull; 32-BIT EXR</span>
              <button
                onClick={handleTriggerScan}
                disabled={isScanning}
                className={`px-2.5 py-0.5 rounded border text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                  isScanning
                    ? 'bg-emerald-500/40 text-emerald-200 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] font-semibold'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/40'
                }`}
              >
                <Scan className="w-3 h-3 text-emerald-400 animate-spin" />
                <span>{isScanning ? 'DIAGNOSTIC SCAN ACTIVE...' : 'SCAN MESH'}</span>
              </button>
            </div>

            {/* Render Pass Selector */}
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 rounded-xl border border-white/[0.08] text-[10px] font-mono">
                {(['rendered', 'clay', 'wire'] as RenderMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      if (!isScanning) {
                        setActiveRenderMode(mode);
                        setSampleCount(256);
                      }
                    }}
                    className={`py-1.5 rounded-lg uppercase tracking-wider transition-all text-center cursor-pointer ${
                      activeRenderMode === mode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg font-semibold scale-[1.02]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {mode === 'rendered' ? 'RENDERED' : mode === 'clay' ? 'CLAY' : 'WIRE'}
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport Frame Box */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner group/viewport">
              
              {/* Stacked Portrait Pass Images */}
              <motion.img
                src="/profile/profile_rendered.png"
                alt="Rendered Pass"
                initial={false}
                animate={{ opacity: activeRenderMode === 'rendered' ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              />
              <motion.img
                src="/profile/profile_clay.png"
                alt="Clay Pass"
                initial={false}
                animate={{ opacity: activeRenderMode === 'clay' ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              />
              <motion.img
                src="/profile/profile_wire.png"
                alt="Wireframe Pass"
                initial={false}
                animate={{ opacity: activeRenderMode === 'wire' ? 1 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              />

              {/* Interactive Laser Mesh Scan Line Beam */}
              <AnimatePresence>
                {isScanning && (
                  <>
                    <motion.div
                      key="scan-beam"
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
                      className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 shadow-[0_0_25px_rgba(52,211,153,1),0_0_50px_rgba(52,211,153,0.8)] z-30 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none z-20 animate-pulse" />

                    {/* Stage Diagnostic HUD Overlay Notification */}
                    {scanMessage && (
                      <motion.div
                        key={scanMessage.stage}
                        initial={{ opacity: 0, y: -12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="absolute top-4 left-4 right-4 z-30 bg-black/90 p-3 rounded-2xl border border-emerald-500/50 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                              {scanMessage.title}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-white/90">
                            {scanMessage.subtitle}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                          {scanMessage.stage}
                        </span>
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>

              {/* Viewport Reticle / Corner Crosshairs */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400/80 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400/80 pointer-events-none z-10" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400/80 pointer-events-none z-10" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400/80 pointer-events-none z-10" />

              {/* Center Target Reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 rounded-full pointer-events-none z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>

              {/* Bottom Gradient & Info Card */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white pt-16 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    PASS: {activeRenderMode.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  Sahil Vishwakarma
                </h3>
                <p className="text-xs font-mono text-emerald-400/90 mt-0.5">
                  Dombivli, India &bull; Senior Visualizer & 3D Generalist
                </p>
              </div>
            </div>

            {/* Viewport Bottom Status Bar */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sliders className="w-3 h-3" />
                SAMPLE: {sampleCount}/4096 {sampleCount === 4096 ? '[COMPLETE]' : '[COMPUTING...]'}
              </span>
              <span>RENDER TIME: 00:00:14.22</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Technical Skills Section */}
      <div id="skills" className="mb-28 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2">
              TECHNICAL STACK & PIPELINE
            </span>
            <h3 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
              Technical Skills
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Click any node to inspect plugins, render engines & workflow highlights
            </p>
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {PROFILE_INFO.softwareArsenal.map((sw) => (
              <motion.div
                key={sw.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedSoftwareModal(SOFTWARE_DETAILS[sw.name] || null)}
                onHoverStart={() => setHoveredSoftware(sw.name)}
                onHoverEnd={() => setHoveredSoftware(null)}
                className={`p-5 rounded-2xl bg-[#0f1015] border transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                  hoveredSoftware === sw.name 
                    ? 'border-emerald-500/60 bg-[#14161f] shadow-[0_0_30px_rgba(16,185,129,0.15)] -translate-y-1' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/05 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all shadow-md">
                        {renderSoftwareIcon(sw.name)}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                          {sw.name}
                        </h4>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] inline-block mt-1">
                          {sw.category.split('&')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Production Ready" />
                      <Maximize2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {sw.level}
                    </span>
                    <span className="text-[10px] text-neutral-500">INSPECT</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Experience & Career Journey */}
      <div className="relative z-10">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2">
            PRODUCTION TIMELINE & BACKGROUND
          </span>
          <h3 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Career Journey & Experience
          </h3>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Click any keyframe diamond to highlight milestone details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Context Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0f1015] border border-white/10 backdrop-blur-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-medium text-white mb-2">
                Production Experience
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                4+ years working across 3D CGI, motion graphics, visualization, and compositing for brands and campaigns.
              </p>
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE KEYFRAME: KF_{activeKeyframe + 1}
              </div>
            </div>
          </div>

          {/* Right Column: Keyframe Timeline Track */}
          <div className="lg:col-span-8 space-y-6 relative before:absolute before:left-4 before:-translate-x-1/2 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500/50 before:to-neutral-800">
            
            {PROFILE_INFO.experience.map((exp, idx) => (
              <div
                key={idx}
                onClick={() => setActiveKeyframe(idx)}
                className="pl-10 relative group cursor-pointer"
              >
                {/* Glowing Keyframe Diamond Dot */}
                <div className={`absolute left-4 top-6 -translate-x-1/2 w-6 h-6 rounded-md bg-[#090a0d] border-2 rotate-45 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] ${
                  activeKeyframe === idx 
                    ? 'border-emerald-400 bg-emerald-400 scale-125' 
                    : 'border-emerald-500/60 group-hover:scale-110 group-hover:border-emerald-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${activeKeyframe === idx ? 'bg-black' : 'bg-emerald-400'}`} />
                </div>

                {/* Timeline Card */}
                <div className={`p-6 sm:p-7 rounded-3xl bg-[#0f1015] border transition-all shadow-xl ${
                  activeKeyframe === idx
                    ? 'border-emerald-500/60 bg-[#131620] ring-1 ring-emerald-500/40 shadow-emerald-950/40'
                    : 'border-white/10 hover:border-emerald-500/30 hover:bg-[#13151c]'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xl font-semibold text-white">
                        {exp.role}
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 whitespace-nowrap self-start sm:self-auto">
                      {exp.period}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-white/90 block mb-3">
                    {exp.company}
                  </span>

                  <p className="text-sm text-neutral-300 leading-relaxed font-light">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Education Item on the Keyframe Track */}
            <div 
              onClick={() => setActiveKeyframe(2)}
              className="pl-10 relative group cursor-pointer"
            >
              <div className={`absolute left-4 top-6 -translate-x-1/2 w-6 h-6 rounded-md bg-[#090a0d] border-2 rotate-45 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] ${
                activeKeyframe === 2
                  ? 'border-cyan-400 bg-cyan-400 scale-125'
                  : 'border-cyan-500/60 group-hover:scale-110 group-hover:border-cyan-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${activeKeyframe === 2 ? 'bg-black' : 'bg-cyan-400'}`} />
              </div>

              <div className={`p-6 sm:p-7 rounded-3xl bg-[#0f1015] border transition-all shadow-xl ${
                activeKeyframe === 2
                  ? 'border-cyan-500/60 bg-[#101720] ring-1 ring-cyan-500/40 shadow-cyan-950/40'
                  : 'border-white/10 hover:border-cyan-500/30 hover:bg-[#13151c]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xl font-semibold text-white">
                      Bachelor of Mass Media (BMM)
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 whitespace-nowrap self-start sm:self-auto">
                    2019 – 2022
                  </span>
                </div>

                <span className="text-sm font-medium text-white/90 block">
                  University of Mumbai
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Interactive Software Inspector Modal */}
      <AnimatePresence>
        {selectedSoftwareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0f1118] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSoftwareModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>PIPELINE NODE INSPECTOR</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-emerald-500/40 p-2.5 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  {renderSoftwareIcon(selectedSoftwareModal.name)}
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {selectedSoftwareModal.name}
                  </h3>
                  <p className="text-xs font-mono text-emerald-400/90 mt-0.5">
                    Category: {selectedSoftwareModal.category} &bull; Level: {selectedSoftwareModal.level}
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-200 leading-relaxed mb-6 font-light">
                {selectedSoftwareModal.description}
              </p>

              {/* Plugins & Render Engines */}
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-neutral-400 block mb-2">
                  PLUGINS & RENDER ENGINES
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedSoftwareModal.plugins.map((plugin) => (
                    <span key={plugin} className="text-xs px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
                      + {plugin}
                    </span>
                  ))}
                </div>
              </div>

              {/* Workflow Highlights */}
              <div className="mb-8">
                <span className="text-xs font-mono uppercase text-neutral-400 block mb-2">
                  PRODUCTION HIGHLIGHTS
                </span>
                <div className="space-y-2">
                  {selectedSoftwareModal.workflowHighlights.map((hl) => (
                    <div key={hl} className="flex items-center gap-2 text-sm text-neutral-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedSoftwareModal(null)}
                className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Close Inspector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
