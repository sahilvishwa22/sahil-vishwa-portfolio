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
  formalName: "Sahil Vishwakarma",
  title: "Senior Visualizer & 3D Generalist",
  location: "Dombivli, India",
  email: "sahilvishwa78628@gmail.com",
  phone: "+91 9892142797",
  whatsapp: "https://wa.me/919892142797",
  resumePath: "/resume/Sahil_Vishwa_Resume.pdf",
  bio: "Senior Visualizer and 3D Generalist with 4+ years of experience across graphic design, 3D visualization, CGI compositing, and motion graphics. Specializing in CGI content for brands like Westside, Vithobha Healthcare, ACCA, OIAI, A&H, and Xeno's Play Space.",
  education: [
    {
      degree: "Bachelor of Mass Media (BMM)",
      institution: "Mumbai University",
      period: "2019 – 2022"
    }
  ],
  experience: [
    {
      role: "Senior Visualizer & 3D Motion Graphic Artist",
      company: "Oktobuzz",
      period: "2024 – Present",
      description: "Handling CGI, 3D visualization, motion graphics, and pass compositing. Primary focus on Westside CGI campaigns—experimenting with social trends and creating visual content used across Westside retail stores in India—along with work for Vithobha Healthcare, ACCA, OIAI, A&H, Xeno's Play Space, and promotional campaigns for Chetan Bhagat and Amish Tripathi."
    },
    {
      role: "Graphic Designer",
      company: "PentableU (BKC)",
      period: "2022 – 2024",
      description: "Developed core graphic design, social media content, UGC videos, poster design, print processes, and client management over 2 years. Taught himself Blender on weekends and created low-poly 3D assets for indie game developers."
    }
  ],
  softwareArsenal: [
    { name: "Blender", level: "Expert / Daily Driver", category: "3D Modeling & Rendering", logo: "/logos/blender.svg" },
    { name: "Substance Painter", level: "Advanced / Daily Driver", category: "PBR & Texturing", logo: "/logos/substance-painter.svg" },
    { name: "ZBrush", level: "Advanced", category: "Digital Sculpting", logo: "/logos/zbrush.svg" },
    { name: "Marvelous Designer", level: "Advanced", category: "Cloth Simulation", logo: "/logos/marvelous-designer.svg" },
    { name: "JangaFX Suite", level: "Advanced", category: "EmberGen, LiquiGen & GeoGen", logo: "/logos/jangafx.svg" },
    { name: "Adobe Suite", level: "Expert / Daily Driver", category: "Ae, Ps, Ai, Pr", logo: "/logos/adobe-suite.svg" },
    { name: "Syntheyes", level: "Advanced", category: "3D Camera Tracking", logo: "/logos/syntheyes.svg" },
    { name: "ComfyUI", level: "Expert / Custom Workflows", category: "Custom AI Workflows", logo: "/logos/comfyui.svg" },
    { name: "Freepik AI Suite", level: "Daily Driver", category: "AI Production Tasks", logo: "/logos/freepik.svg" }
  ],
  skills: [
    "CGI Commercial Advertising",
    "FOOH (Fake Out Of Home) VFX",
    "Fashion & Lifestyle Motion Graphics",
    "Hard-Surface & Organic 3D Modeling",
    "Procedural Texturing & Shading",
    "Cinematic Lighting & Lookdev",
    "Digital Sculpting & Character CGI",
    "Camera Projection & Live Matchmove",
    "Product Renders & FMCG Packaging",
    "Creative Direction & Storyboarding"
  ]
};
