import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'logos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const logos = {
  'blender.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M12.44 2.1c-.34.1-.5.48-.34.8.2.4.67.57 1.05.38.7-.35 1.54-.15 2.03.48.5.63.46 1.54-.08 2.13-.53.58-1.42.66-2.03.18-.3-.24-.74-.18-.97.13-.23.3-.17.74.13.97 1.25.98 3.03.82 4.1-.38.98-1.09 1.08-2.73.23-3.92-.93-1.3-2.77-1.7-4.12-0.77z" fill="#EA7600"/>
    <path d="M15.42 8.44c-1.34-1.34-3.44-1.44-4.88-.24l-6.8-5.1A.75.75 0 0 0 2.7 4.28l4.47 5.96c-1.46 1.83-1.27 4.5.47 6.1 1.94 1.78 4.9 1.62 6.64-.34 1.74-1.96 1.58-4.92-.36-6.7a4.34 4.34 0 0 0-1.5-1.12zM12.5 15.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#EA7600"/>
    <circle cx="12.5" cy="13" r="1.6" fill="#226196"/>
  </svg>`,

  'substance-painter.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#1B0A04"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="#FF4E00"/>
    <path d="M5 5h5v5H5z" fill="#FF8A00"/>
    <text x="6.5" y="16" fill="#FFFFFF" font-size="10.5" font-weight="800" font-family="Arial, sans-serif">Pt</text>
  </svg>`,

  'zbrush.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#111216"/>
    <path d="M4.5 5.5h15l-9.5 12H19.5v2.5h-15l9.5-12H4.5V5.5z" fill="#E11D48"/>
    <circle cx="18" cy="6.5" r="1.8" fill="#38BDF8"/>
  </svg>`,

  'marvelous-designer.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#071626"/>
    <path d="M4.5 18.5V5.5l5 6.5L14.5 5.5v13H12V9.8L9.5 13.8 7V9.8v8.7H4.5z" fill="#00D2FE"/>
    <path d="M14.5 18.5l5-13v13H17v-7.8l-2.5 7.8z" fill="#0072FF"/>
  </svg>`,

  'jangafx.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#120803"/>
    <path d="M12 2.5c0 3.8-3.2 6-3.2 9.2 0 3.2 2.7 6 6.4 6s6.4-2.7 6.4-6.5c0-4.8-4.8-6.5-4.8-9.8 0 0-1.6 2.2-1.6 4.3 0 2.2-2.1 3.2-3.2 1.1z" fill="#F97316"/>
    <path d="M10.4 10c0 2.7-2.1 3.8-2.1 6 0 2.2 1.6 3.8 3.8 3.8s3.8-1.6 3.8-3.8c0-2.7-2.7-3.8-2.7-6 0 0-1.1 1.1-1.1 2.4 0 1.3-1.7 2-1.7.3z" fill="#FACC15"/>
  </svg>`,

  'adobe-suite.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#240404"/>
    <path d="M13.8 4.5h4.7L21.5 20h-4.2l-1.3-4.3h-4.8l-1.2 4.3H5.2L13.8 4.5zm.2 3.8l-1.6 5.6h3.2L14 8.3z" fill="#FF2626"/>
    <path d="M2.5 4.5h5.2l3 9.4H8L5.5 7.3 2.5 4.5z" fill="#E61C24"/>
  </svg>`,

  'syntheyes.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#021B12"/>
    <circle cx="12" cy="12" r="7" stroke="#10B981" stroke-width="1.6"/>
    <circle cx="12" cy="12" r="3" fill="#10B981"/>
    <path d="M12 1.5v3.5M12 19v3.5M1.5 12h3.5M19 12h3.5" stroke="#34D399" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,

  'comfyui.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#091712"/>
    <circle cx="6.5" cy="6.5" r="2.7" fill="#10B981"/>
    <circle cx="17.5" cy="8.5" r="2.7" fill="#3B82F6"/>
    <circle cx="12" cy="17.5" r="2.7" fill="#A855F7"/>
    <path d="M8.9 7.6l6.3 1.9M8.5 8.9l2.6 6.1M15.8 10.5l-2.2 5.1" stroke="#34D399" stroke-width="1.4" opacity="0.85"/>
  </svg>`,

  'freepik.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#031028"/>
    <path d="M12 2.5l2.4 7.1L21.5 12l-7.1 2.4L12 21.5l-2.4-7.1L2.5 12l7.1-2.4L12 2.5z" fill="#0055FF"/>
    <path d="M18 2.5l1 3.2 3.2 1-3.2 1-1 3.2-1-3.2-3.2-1 3.2-1 1-3.2z" fill="#38BDF8"/>
  </svg>`
};

for (const [filename, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(dir, filename), content.trim());
  console.log('Saved:', filename);
}
