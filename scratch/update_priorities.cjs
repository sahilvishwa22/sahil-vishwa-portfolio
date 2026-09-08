const fs = require('fs');

const priorityMap = {
  'proj-1': 'Primary',
  'proj-2': 'Secondary',
  'proj-77': 'Tertiary',
  'proj-6': 'Tertiary',
  'proj-7': 'Tertiary',
  'proj-8': 'Secondary',
  'proj-9': 'Primary',
  'proj-10': 'Tertiary',
  'proj-11': 'Primary',
  'proj-12': 'Secondary',
  'proj-13': 'Primary',
  'proj-14': 'Tertiary',
  'proj-15': 'Secondary',
  'proj-16': 'Primary',
  'proj-17': 'Secondary',
  'proj-18': 'Tertiary',
  'proj-19': 'Secondary',
  'proj-20': 'Secondary',
  'proj-21': 'Secondary',
  'proj-22': 'Primary',
  'proj-23': 'Secondary',
  'proj-24': 'Tertiary',
  'proj-25': 'Tertiary',
  'proj-26': 'Tertiary',
  'proj-27': 'Tertiary',
  'proj-28': 'Secondary',
  'proj-29': 'Secondary',
  'proj-30': 'Secondary',
  'proj-31': 'Primary',
  'proj-32': 'Primary',
  'proj-33': 'Primary',
  'proj-34': 'Secondary',
  'proj-36': 'Secondary',
  'proj-75': 'Tertiary',
  'proj-76': 'Tertiary',
  'proj-81': 'Tertiary',
  'proj-40': 'Secondary',
  'proj-41': 'Primary',
  'proj-42': 'Secondary',
  'proj-43': 'Primary',
  'proj-44': 'Primary',
  'proj-45': 'Primary',
  'proj-46': 'Secondary',
  'proj-47': 'Primary',
  'proj-48': 'Secondary',
  'proj-49': 'Secondary',
  'proj-50': 'Secondary',
  'proj-51': 'Secondary',
  'proj-52': 'Secondary',
  'proj-53': 'Tertiary',
  'proj-54': 'Tertiary',
  'proj-55': 'Tertiary',
  'proj-56': 'Tertiary',
  'proj-57': 'Tertiary',
  'proj-58': 'Tertiary',
  'proj-59': 'Tertiary',
  'proj-60': 'Tertiary',
  'proj-61': 'Primary',
  'proj-62': 'Secondary',
  'proj-66': 'Secondary',
  'proj-67': 'Secondary',
  'proj-68': 'Secondary',
  'proj-69': 'Tertiary',
  'proj-70': 'Tertiary',
  'proj-71': 'Secondary',
  'proj-72': 'Secondary',
  'proj-73': 'Secondary',
  'proj-74': 'Tertiary',
  'proj-78': 'Tertiary',
  'proj-79': 'Tertiary',
  'proj-80': 'Tertiary',
  'proj-camera-angles': 'Secondary',
  'still-1': 'Secondary',
  'still-2': 'Secondary',
  'still-3': 'Tertiary',
  'still-4': 'Secondary'
};

const rawProjectsPath = './src/data/projects.json';
const projects = JSON.parse(fs.readFileSync(rawProjectsPath, 'utf8'));

let updatedCount = 0;
projects.forEach(p => {
  if (priorityMap[p.id]) {
    p.priority = priorityMap[p.id];
    updatedCount++;
  } else {
    p.priority = 'Secondary'; // default fallback if unlisted
  }
});

fs.writeFileSync(rawProjectsPath, JSON.stringify(projects, null, 2), 'utf8');
console.log(`Updated ${updatedCount} items in projects.json with priority tags.`);
