const fs = require('fs');
const projects = JSON.parse(fs.readFileSync('./src/data/projects.json', 'utf8'));

console.log('--- ALL VIDEO PROJECTS ---');
projects.forEach((p) => {
  if (!p.isStill && p.videoSrc) {
    console.log(`${p.id} | ${p.title} | Client: ${p.client} | Cat: ${p.category} | Folder: ${p.folder}`);
  }
});
