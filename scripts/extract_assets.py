import os
import subprocess
import json
import shutil

VIDEO_DIR = r'D:\Vishwa.D.Sahil\Oktobuzz\2026\Videos'
PROJECT_DIR = r'C:\Users\intel\.gemini\antigravity\scratch\sahil-vishwa-portfolio'
PUBLIC_DIR = os.path.join(PROJECT_DIR, 'public')
POSTERS_DIR = os.path.join(PUBLIC_DIR, 'posters')
PROFILE_DIR = os.path.join(PUBLIC_DIR, 'profile')
RESUME_DIR = os.path.join(PUBLIC_DIR, 'resume')
STILLS_DIR = os.path.join(PUBLIC_DIR, 'stills')
DATA_DIR = os.path.join(PROJECT_DIR, 'src', 'data')

os.makedirs(POSTERS_DIR, exist_ok=True)
os.makedirs(PROFILE_DIR, exist_ok=True)
os.makedirs(RESUME_DIR, exist_ok=True)
os.makedirs(STILLS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# 1. Copy Profile Picture & Resume
profile_src = r'D:\Vishwa.D.Sahil\PROFILE\243764281_2981094558872833_4991402137568640483_n.jpg'
if os.path.exists(profile_src):
    shutil.copy2(profile_src, os.path.join(PROFILE_DIR, 'sahil_vishwa.jpg'))
    print('Copied profile image.')

resume_src = r'D:\Vishwa.D.Sahil\RESUME\RESUME.pdf'
if os.path.exists(resume_src):
    shutil.copy2(resume_src, os.path.join(RESUME_DIR, 'Sahil_Vishwa_Resume.pdf'))
    print('Copied resume PDF.')

# 2. Copy 3D Stills
stills_src = r'D:\Vishwa.D.Sahil\Pentablue Data\POSTER'
if os.path.exists(stills_src):
    for f in ['MANGA.jpg', 'CULT.jpg', 'COMIC DARKWING TECNIQUE.jpg', 'THIRDS.jpg']:
        p = os.path.join(stills_src, f)
        if os.path.exists(p):
            shutil.copy2(p, os.path.join(STILLS_DIR, f))
    print('Copied 3D concept stills.')

# 3. Process Videos
projects = []
vid_id = 1

def clean_title(filename):
    name, _ = os.path.splitext(filename)
    name = name.replace('Sprint-', '').replace('-FInal', '').replace('-Final', '').replace('_CGI', ' CGI').replace('_', ' ').strip()
    return name

for root, dirs, files in sorted(os.walk(VIDEO_DIR)):
    # Skip Extras folder
    if 'extras' in os.path.basename(root).lower():
        continue
    for file in sorted(files):
        if 'xeno-cgi2' in file.lower():
            continue
        if file.lower().endswith(('.mp4', '.mov')):
            full_path = os.path.join(root, file)
            rel_folder = os.path.relpath(root, VIDEO_DIR)
            category = rel_folder if rel_folder != '.' else 'Commercial'
            
            # Use ffprobe
            cmd = ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration', '-of', 'json', full_path]
            try:
                out = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
                info = json.loads(out)
                w = info['streams'][0].get('width', 1920)
                h = info['streams'][0].get('height', 1080)
                dur = float(info['streams'][0].get('duration', 10.0))
            except Exception as e:
                w, h, dur = 1920, 1080, 10.0

            is_vertical = h > w
            clean_name = clean_title(file)
            clean_file_base = "".join([c if c.isalnum() else "_" for c in os.path.splitext(file)[0]])
            poster_filename = f'poster_{vid_id}_{clean_file_base}.jpg'
            poster_path = os.path.join(POSTERS_DIR, poster_filename)

            # Generate poster frame at min(2.0, dur * 0.3)
            ss_time = min(2.0, max(0.5, dur * 0.25))
            ff_cmd = [
                'ffmpeg', '-y', '-ss', str(ss_time), '-i', full_path,
                '-vframes', '1', '-q:v', '2', poster_path
            ]
            try:
                subprocess.run(ff_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            except Exception as e:
                print(f'Poster extraction error for {file}: {e}')

            # Tagging and categorization
            cat_tag = 'CGI & 3D Ads'
            client = 'Westside'
            tags = ['3D CGI', 'Commercial']
            if 'Sprint' in rel_folder:
                cat_tag = 'Motion & Reels'
                client = 'Sprint'
                tags = ['Motion Graphics', 'Fashion Editorial', 'Reel']
            elif 'Vithobha' in rel_folder:
                cat_tag = 'Product & CGI'
                client = 'Vithobha'
                tags = ['Product Render', '3D Lookdev', 'Commercial']
            elif 'OIAI' in rel_folder:
                cat_tag = 'Product & CGI'
                client = 'OIAI'
                tags = ['Tech Product', '3D Generalist', 'Cinematic']
            elif 'A&H' in rel_folder:
                cat_tag = 'Brand Film'
                client = 'A&H Capital'
                tags = ['Brand Identity', '3D Motion']
            elif 'ACCA' in rel_folder:
                cat_tag = 'Motion & Reels'
                client = 'ACCA'
                tags = ['Motion Design', 'Abstract 3D']
            elif 'Xeno' in rel_folder:
                cat_tag = 'Product & CGI'
                client = 'Xeno'
                tags = ['Commercial CGI', 'Product']
            elif 'Extras' in rel_folder:
                cat_tag = 'CGI & 3D Ads'
                client = 'Commercial Studio'
                tags = ['CGI Advertising', '3D Motion']

            projects.append({
                'id': f'proj-{vid_id}',
                'title': clean_name,
                'client': client,
                'folder': rel_folder,
                'category': cat_tag,
                'filename': file,
                'videoSrc': f'/local-videos/{rel_folder.replace(os.sep, "/")}/{file}',
                'posterSrc': f'/posters/{poster_filename}',
                'width': w,
                'height': h,
                'aspectRatio': '9:16' if is_vertical else '16:9',
                'isVertical': is_vertical,
                'duration': round(dur, 1),
                'tags': tags,
                'tools': ['Blender', 'Cinema 4D', 'After Effects', 'Substance Painter'] if 'CGI' in cat_tag else ['After Effects', 'Blender', 'Premiere Pro', 'Photoshop'],
                'role': 'Senior Visualizer & 3D Lead' if 'CGI' in cat_tag else 'Motion Graphic Artist & Art Direction'
            })
            vid_id += 1

# Write projects.json
with open(os.path.join(DATA_DIR, 'projects.json'), 'w', encoding='utf-8') as f:
    json.dump(projects, f, indent=2)

print(f'Successfully processed {len(projects)} video projects and generated posters!')
