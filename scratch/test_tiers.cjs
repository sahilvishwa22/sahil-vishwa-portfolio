const fs = require('fs');
const projects = JSON.parse(fs.readFileSync('./src/data/projects.json', 'utf8'));

function getWorkPriorityTier(p) {
  if (p.id === 'proj-1') {
    return 3; // A&H Capital explicitly requested as Tertiary / all other stuff
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

  // Tier 3 (Bottom): All other stuffs
  return 3;
}

console.log('=== TIER 1: PRIMARY CGI (TOP) ===');
projects.filter(p => getWorkPriorityTier(p) === 1).forEach(p => console.log(` - ${p.id}: ${p.title} (${p.category})`));

console.log('\n=== TIER 2: MIX OF MOTION & AI (MIDDLE) ===');
projects.filter(p => getWorkPriorityTier(p) === 2).forEach(p => console.log(` - ${p.id}: ${p.title} (${p.category} / ${p.targetCategory})`));

console.log('\n=== TIER 3: ALL OTHER STUFF (BOTTOM) ===');
projects.filter(p => getWorkPriorityTier(p) === 3).forEach(p => console.log(` - ${p.id}: ${p.title} (${p.category} / ${p.targetCategory})`));
