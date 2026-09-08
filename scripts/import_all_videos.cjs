const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dBase = 'D:\\Vishwa.D.Sahil\\Oktobuzz\\2026\\Videos';
const publicDir = path.resolve(__dirname, '..', 'public');
const projects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'projects.json'), 'utf8'));

console.log(`Checking ${projects.length} projects for videos...`);

let processed = 0;
let skipped = 0;
let errors = 0;

for (const p of projects) {
  if (!p.videoSrc) continue;

  const cleanRel = decodeURIComponent(p.videoSrc.replace(/^\/local-videos\//, ''));
  const dPath = path.join(dBase, cleanRel);
  const targetPath = path.join(publicDir, 'local-videos', cleanRel);

  // If already exists and is non-empty, skip
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000) {
    skipped++;
    continue;
  }

  if (!fs.existsSync(dPath)) {
    console.warn(`[NOT FOUND ON D] ${dPath}`);
    errors++;
    continue;
  }

  // Ensure target folder exists
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  const rawSizeMB = (fs.statSync(dPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\nEncoding [${p.id}] ${p.title} (${rawSizeMB} MB) -> ${path.basename(targetPath)}`);

  const tempPath = targetPath + '.tmp.mp4';
  const ffmpegCmd = `ffmpeg -y -i "${dPath}" -vf "scale='min(1920,iw)':-2" -c:v libx264 -crf 24 -preset fast -movflags +faststart -c:a aac -b:a 128k -pix_fmt yuv420p "${tempPath}"`;

  try {
    execSync(ffmpegCmd, { stdio: 'ignore' });
    const optSizeMB = (fs.statSync(tempPath).size / (1024 * 1024)).toFixed(2);
    console.log(` -> Done: ${optSizeMB} MB`);
    fs.renameSync(tempPath, targetPath);
    processed++;
  } catch (err) {
    console.error(` -> Error encoding ${p.title}:`, err.message);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    errors++;
  }
}

console.log('\n=======================================');
console.log(`Processed / Encoded: ${processed}`);
console.log(`Already existed (skipped): ${skipped}`);
console.log(`Errors / Missing: ${errors}`);
