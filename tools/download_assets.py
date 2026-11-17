import os
import re
import urllib.request
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://tecton-arch-tempalte.modulify.website"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

os.makedirs("raw_pages", exist_ok=True)
os.makedirs("images", exist_ok=True)
os.makedirs("public", exist_ok=True)

with open("pages_manifest.txt", "r", encoding="utf-8") as f:
    pages = [line.strip() for line in f if line.strip()]

def fetch_data(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()

# 1. Download all pages HTML
print("Step 1: Downloading all HTML pages...")
for p in pages:
    safe_name = "index" if p == "/" else p.strip("/").replace("/", "__")
    file_path = f"raw_pages/{safe_name}.html"
    if not os.path.exists(file_path):
        url = urllib.parse.urljoin(BASE_URL, p)
        try:
            content = fetch_data(url)
            with open(file_path, "wb") as f:
                f.write(content)
            print(f"  Saved {p} -> {file_path}")
        except Exception as e:
            print(f"  Failed {p}: {e}")

# 2. Collect all assets
images_to_download = set()
scripts_to_download = set()
css_to_download = set()
other_assets = set()

for fname in os.listdir("raw_pages"):
    with open(f"raw_pages/{fname}", "r", encoding="utf-8") as f:
        html = f.read()
    
    # Image urls in Next.js image
    for m in re.finditer(r'/_next/image\?url=([^&"\']+)', html):
        raw = urllib.parse.unquote(m.group(1))
        images_to_download.add(raw)
        
    # Direct /images/
    for m in re.finditer(r'["\'](/images/[^"\'\s>]+)["\']', html):
        images_to_download.add(m.group(1))
        
    # Scripts
    for m in re.finditer(r'["\'](/_next/static/[^"\'\s>]+\.js)["\']', html):
        scripts_to_download.add(m.group(1))
        
    # CSS
    for m in re.finditer(r'["\'](/_next/static/[^"\'\s>]+\.css)["\']', html):
        css_to_download.add(m.group(1))
        
    # Favicon, icons, etc.
    for m in re.finditer(r'["\'](/[^"\'\s>]+\.(?:svg|ico|png|webmanifest))["\']', html):
        p = m.group(1)
        if not p.startswith('/_next') and not p.startswith('/images'):
            other_assets.add(p)

print(f"\nDiscovered:")
print(f"  Images: {len(images_to_download)}")
print(f"  Scripts: {len(scripts_to_download)}")
print(f"  CSS: {len(css_to_download)}")
print(f"  Other: {len(other_assets)}")

# Download assets helper
def download_asset(asset_path):
    # local path relative to root
    clean_path = asset_path.lstrip('/')
    local_file = Path(clean_path)
    local_file.parent.mkdir(parents=True, exist_ok=True)
    
    if local_file.exists() and local_file.stat().st_size > 0:
        return f"Exists: {asset_path}"
        
    url = urllib.parse.urljoin(BASE_URL, asset_path)
    try:
        data = fetch_data(url)
        with open(local_file, "wb") as f:
            f.write(data)
        return f"Downloaded: {asset_path} ({len(data)} bytes)"
    except Exception as e:
        return f"Error {asset_path}: {e}"

print("\nStep 2: Downloading CSS...")
for c in css_to_download:
    print(download_asset(c))

# 3. Discover fonts from CSS files
fonts_to_download = set()
for c in css_to_download:
    local_c = Path(c.lstrip('/'))
    if local_c.exists():
        with open(local_c, "r", encoding="utf-8", errors="ignore") as f:
            css_text = f.read()
        # url(../media/...) or url(/_next/...)
        for m in re.finditer(r'url\(([^)]+)\)', css_text):
            raw_url = m.group(1).strip('"\'')
            if raw_url.startswith('../media/'):
                fonts_to_download.add('/_next/static/media/' + raw_url.replace('../media/', ''))
            elif raw_url.startswith('/_next/'):
                fonts_to_download.add(raw_url)

print(f"\nStep 3: Found {len(fonts_to_download)} fonts in CSS. Downloading fonts...")
for f in fonts_to_download:
    print(download_asset(f))

print("\nStep 4: Downloading scripts...")
with ThreadPoolExecutor(max_workers=6) as executor:
    results = executor.map(download_asset, scripts_to_download)
    for r in results:
        print(" ", r)

print("\nStep 5: Downloading other root assets (favicon, etc.)...")
for o in other_assets:
    print(download_asset(o))

print("\nStep 6: Downloading images (high-res)...")
with ThreadPoolExecutor(max_workers=6) as executor:
    results = executor.map(download_asset, images_to_download)
    for r in results:
        print(" ", r)

print("\nDone downloading all assets!")
