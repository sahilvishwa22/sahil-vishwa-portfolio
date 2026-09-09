import rawProjects from './projects.json';

export interface Project {
  id: string;
  title: string;
  client: string;
  folder?: string;
  category: string;
  filename?: string;
  videoSrc?: string;
  posterSrc: string;
  makingOfVideoSrc?: string;
  width?: number;
  height?: number;
  aspectRatio: string;
  isVertical: boolean;
  duration?: number;
  tags: string[];
  tools: string[];
  role: string;
  description?: string;
  isStill?: boolean;
  targetCategory?: string;
  galleryImages?: string[];
  priority?: 'Primary' | 'Secondary' | 'Tertiary';
  playbackRate?: number;
  award?: {
    rank: string;
    title: string;
    category: string;
    subCategory: string;
    year: string;
    link?: string;
    agency?: string;
  };
}

const stillProjects: Project[] = [
  {
    id: 'still-2',
    title: 'Cult Sci-Fi Render',
    client: 'Personal Artwork',
    category: 'Graphic Design',
    posterSrc: '/stills/CULT.jpg',
    width: 1080,
    height: 1440,
    aspectRatio: '3:4',
    isVertical: true,
    tags: ['3D Lighting', 'Atmospheric Lookdev', 'Environment'],
    tools: ['Blender', 'After Effects', 'Photoshop'],
    role: '3D Gernalist',
    description: 'Atmospheric sci-fi environment exploration emphasizing volumetric lighting and cinematic scale.',
    isStill: true,
    targetCategory: '3D Stills',
    priority: 'Secondary'
  },
  {
    id: 'still-4',
    title: 'Thirds Spatial Composition',
    client: 'Personal Artwork',
    category: 'Graphic Design',
    posterSrc: '/stills/THIRDS.jpg',
    width: 1080,
    height: 1440,
    aspectRatio: '3:4',
    isVertical: true,
    tags: ['Rule of Thirds', 'CGI Framing', 'Editorial'],
    tools: ['Blender', 'After Effects', 'Photoshop'],
    role: '3D Gernalist',
    description: 'Cinematographic study on camera focal lengths, rule of thirds, and commercial color grading.',
    isStill: true,
    targetCategory: '3D Stills',
    priority: 'Secondary'
  }
];

// Helper to compute simplified aspect ratio string
function getAspectRatioLabel(w?: number, h?: number, currentAspect?: string): string {
  if (currentAspect && currentAspect.includes(':')) {
    const parts = currentAspect.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] < 50 && parts[1] < 50) {
      return currentAspect;
    }
  }
  if (!w || !h) return '16:9';
  const ratio = w / h;
  if (Math.abs(ratio - (21 / 9)) < 0.15 || Math.abs(ratio - 2.35) < 0.15 || Math.abs(ratio - 2.37) < 0.15) return '21:9';
  if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16';
  if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9';
  if (Math.abs(ratio - 4 / 5) < 0.05) return '4:5';
  if (Math.abs(ratio - 3 / 4) < 0.05) return '3:4';
  if (Math.abs(ratio - 1) < 0.05) return '1:1';
  return `${w}:${h}`;
}

// Process raw projects to ensure accurate aspect ratios
const processedRawProjects: Project[] = (rawProjects as any[]).map(p => ({
  ...p,
  aspectRatio: getAspectRatioLabel(p.width, p.height, p.aspectRatio)
}));

export function getWorkPriorityTier(p: Project): number {
  if (p.id === 'proj-1') {
    return 3; // A&H Capital explicitly requested as Tertiary (Bottom)
  }

  // Tier 1 (Top): Primary CGI content
  if (p.priority === 'Primary' && (p.targetCategory === 'CGI' || (p.category && p.category.includes('CGI')))) {
    return 1;
  }

  // Tier 2 (Middle): Mix of Motion Graphics and AI content
  if (
    p.targetCategory === 'Motion Graphics' ||
    p.targetCategory === 'AI' ||
    p.category === 'Motion & Reels' ||
    p.category === 'Viral Reel Content' ||
    p.category === 'Book Promotion'
  ) {
    if (p.targetCategory !== 'Match Move' && !(p.category || '').includes('Camera Tracking')) {
      return 2;
    }
  }

  // Tier 3 (Bottom): All other stuffs (A&H Capital, Tertiary CGI, Matchmove, Stills)
  return 3;
}

// Combine raw video projects and still projects, ordered strictly by Primary CGI -> Motion & AI -> All Other Stuff
export const ALL_PROJECTS: Project[] = [
  ...processedRawProjects,
  ...stillProjects
].sort((a, b) => {
  const tierA = getWorkPriorityTier(a);
  const tierB = getWorkPriorityTier(b);
  return tierA - tierB;
});

export const PROFILE_INFO = {
  name: "Sahil Vishwa",
  formalName: "Sahil Vishwa",
  title: "Senior Visualizer, Motion Graphic Artist and 3D Generalist",
  location: "Dombivli, India",
  email: "sahilvishwa78628@gmail.com",
  phone: "+91 9892142797",
  whatsapp: "https://wa.me/919892142797",
  resumePath: "/resume/Sahil_Vishwa_Resume.pdf",
  bio: "I am Sahil Vishwa, a Senior Visualizer, Motion Graphic Artist and 3D Generalist based in Dombivli, India, with 4+ years of professional experience. I currently work across 3D CGI, motion graphics, visualization, compositing and AI-assisted content at Oktobuzz. I've worked on visual content and CGI projects for brands including Westside, Vithobha Healthcare, ACCA, OIAI, A&H and Xeno's Play Space, along with book promotion projects for Chetan Bhagat and Amish Tripathi. I started my career in 2022 as a Graphic Designer at PentableU in BKC. While working there, I became interested in 3D and started learning Blender on my own, eventually moving into 3D and CGI professionally.",
  education: [
    {
      degree: "Bachelor of Mass Media (BMM)",
      institution: "University of Mumbai",
      period: "2019 – 2022",
      description: "Bachelor of Mass Media from University of Mumbai."
    }
  ],
  experience: [
    {
      role: "Senior Visualizer & 3D Motion Graphic Artist",
      company: "Oktobuzz",
      period: "2024 – Present",
      description: "Working across CGI, 3D visualization, motion graphics, compositing and AI-assisted content. I mainly handle CGI projects for Westside, where I have creative freedom to experiment with ideas and trends while keeping them aligned with the brand. I've also worked on projects for Vithobha Healthcare, ACCA, OIAI, A&H, Xeno's Play Space and book promotions for Chetan Bhagat and Amish Tripathi."
    },
    {
      role: "Graphic Designer",
      company: "PentableU (BKC)",
      period: "2022 – 2024",
      description: "Built my foundation in graphic design, social media content, UGC-style videos, poster design, client handling and print. Alongside my work, I started learning Blender on my own and took on small freelance projects creating low-poly, game-ready 3D assets for indie game developers."
    }
  ],
  softwareArsenal: [
    { name: "Blender", level: "3D Modeling & Rendering", category: "3D Modeling & Rendering", logo: "/logos/blender.svg" },
    { name: "Substance Painter", level: "PBR & Texturing", category: "PBR & Texturing", logo: "/logos/substance-painter.svg" },
    { name: "ZBrush", level: "Digital Sculpting", category: "Digital Sculpting", logo: "/logos/zbrush.svg" },
    { name: "Marvelous Designer", level: "Cloth Simulation", category: "Cloth Simulation", logo: "/logos/marvelous-designer.svg" },
    { name: "JangaFX Suite", level: "Volumetric FX (EmberGen/LiquiGen)", category: "Realtime FX", logo: "/logos/jangafx.svg" },
    { name: "Adobe Suite", level: "Ae, Ps, Ai, Pr", category: "Compositing & Post", logo: "/logos/adobe-suite.svg" },
    { name: "Syntheyes", level: "3D Camera Tracking", category: "3D Camera Tracking", logo: "/logos/syntheyes.svg" },
    { name: "ComfyUI", level: "AI Node Workflows", category: "Custom AI Workflows", logo: "/logos/comfyui.svg" },
    { name: "Freepik AI Suite", level: "Image Generation & Upscaling", category: "AI Production", logo: "/logos/freepik.svg" }
  ],
  skills: [
    "3D CGI",
    "Motion Graphics",
    "3D Visualization",
    "CGI Compositing",
    "Shot + CGI",
    "Complete CGI Videos",
    "High-End 3D Model Edits",
    "UGC-Style Content",
    "Promotional / Sale Content",
    "AI-Assisted Creative Workflows",
    "Brainstorming Creative Ideas",
    "Storyboarding"
  ]
};
