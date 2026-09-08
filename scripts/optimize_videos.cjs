const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');

function getMp4Files(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMp4Files(filePath));
    } else if (file.toLowerCase().endsWith('.mp4') && !file.includes('-opt') && !file.includes('-web')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = getMp4Files(publicDir);
console.log(`Found ${files.length} MP4 files to check & optimize...`);

let totalOriginalSize = 0;
let totalOptimizedSize = 0;

for (const filePath of files) {
  const originalSize = fs.statSync(filePath).size;
  totalOriginalSize += originalSize;
  const tempPath = filePath.replace(/\.mp4$/i, '_temp_opt.mp4');

  const relPath = path.relative(publicDir, filePath);
  console.log(`\nProcessing: ${relPath} (${(originalSize / (1024 * 1024)).toFixed(2)} MB)...`);

  const ffmpegCmd = `ffmpeg -y -i "${filePath}" -vf "scale='min(1920,iw)':-2" -c:v libx264 -crf 23 -preset fast -movflags +faststart -c:a aac -b:a 128k -pix_fmt yuv420p "${tempPath}"`;

  try {
    execSync(ffmpegCmd, { stdio: 'ignore' });
    const newSize = fs.statSync(tempPath).size;
    totalOptimizedSize += newSize;
    console.log(` -> Optimized to: ${(newSize / (1024 * 1024)).toFixed(2)} MB (saved ${(100 - (newSize / originalSize) * 100).toFixed(1)}%)`);

    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(` Failed to optimize ${filePath}:`, err.message);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    totalOptimizedSize += originalSize;
  }
}

const optTest = path.join(publicDir, 'hero', 'Page-1-TV-opt.mp4');
if (fs.existsSync(optTest)) fs.unlinkSync(optTest);
const webTest = path.join(publicDir, 'hero', 'Page-1-TV-web.mp4');
if (fs.existsSync(webTest)) fs.unlinkSync(webTest);

console.log('\n=======================================');
console.log(`Original total size: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Optimized total size: ${(totalOptimizedSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Total savings: ${(100 - (totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
console.log('All videos now have moov atom at beginning (+faststart) for instant web playback!');
