const fs = require('fs');
const projects = JSON.parse(fs.readFileSync('./src/data/projects.json', 'utf8'));

console.log('--- ALL VIDEO PROJECTS (' + projects.length + ' total) ---');
const vids = projects.filter(p => !p.isStill && p.videoSrc);
console.log('Total Videos:', vids.length);
vids.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] ${p.title} | Client: ${p.client} | Cat: ${p.category} | Target: ${p.targetCategory}`);
});
