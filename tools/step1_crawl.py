import os
import re
import urllib.request
import urllib.parse
from pathlib import Path
from collections import deque

BASE_URL = "https://tecton-arch-tempalte.modulify.website"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

OUTPUT_DIR = Path(".")

# Starting seed pages
seed_pages = [
    "/",
    "/about",
    "/archive",
    "/archive/aura-loft",
    "/archive/basalt-ridge",
    "/archive/camber",
    "/archive/lumina",
    "/archive/ochre",
    "/archive/quarry-studio",
    "/archive/sable",
    "/archive/strata",
    "/archive/vellum",
    "/archive/villa-forma",
    "/contact",
    "/enquiries",
    "/journal",
    "/journal/defining-spatial-restraint-with-lead-architect-evelyn-cross",
    "/journal/engineering-the-architecture-of-silence-through-spatial-restraint",
    "/journal/structuring-the-physical-archive-for-future-architectural-studies",
    "/journal/embracing-material-patina-and-the-inevitable-passing-of-time",
    "/journal/discussing-structural-tolerances-with-master-stone-mason-h-vance",
    "/journal/announcing-the-vellum-collection-of-bespoke-luminous-artifacts",
    "/journal/exploring-the-acoustic-weight-of-hand-troweled-raw-plaster",
    "/journal/harnessing-natural-light-as-a-physical-architectural-boundary",
    "/journal/rejecting-the-fallacy-of-ornament-in-modern-architectural-design",
    "/legal/privacy-policy",
    "/legal/terms-of-service",
    "/practice/bespoke-curation",
    "/practice/custom-fabrication",
    "/practice/interior-architecture",
    "/practice/turnkey-execution",
    "/404"
]

visited_pages = set()
pages_html = {}
discovered_assets = set()

queue = deque(seed_pages)

def fetch_url(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as resp:
        return resp.read()

print("--- Phase 1: Crawling all pages ---")
while queue:
    page_path = queue.popleft()
    if page_path in visited_pages:
        continue
    visited_pages.add(page_path)
    
    url = urllib.parse.urljoin(BASE_URL, page_path)
    try:
        data = fetch_url(url)
        html = data.decode('utf-8', 'ignore')
        pages_html[page_path] = html
        print(f"Crawled: {page_path} ({len(html)} bytes)")
        
        # Discover internal links
        for m in re.finditer(r'href=["\']([^"\']+)["\']', html):
            href = m.group(1).split('#')[0].split('?')[0].strip()
            if href.startswith('/') and not href.startswith('//') and not href.startswith('/_next') and not href.endswith(('.svg', '.png', '.jpg', '.jpeg', '.webp', '.css', '.js')):
                if href not in visited_pages and href not in queue:
                    queue.append(href)
                    print(f"  Discovered link: {href}")
        
        # Discover assets in HTML
        # Next chunks & media
        for m in re.finditer(r'(?:src|href)=["\'](/_next/[^"\']+)["\']', html):
            discovered_assets.add(m.group(1))
            
        # Images from /_next/image?url=...
        for m in re.finditer(r'/_next/image\?url=([^&"\']+)', html):
            raw_img_path = urllib.parse.unquote(m.group(1))
            discovered_assets.add(raw_img_path)
            
        # Direct images
        for m in re.finditer(r'(?:src|href)=["\'](/images/[^"\']+)["\']', html):
            discovered_assets.add(m.group(1))
            
        # Favicon and other root assets
        for m in re.finditer(r'(?:src|href)=["\'](/[^"\'\s]+\.(?:svg|png|ico|json|webmanifest))["\']', html):
            discovered_assets.add(m.group(1))
            
    except Exception as e:
        print(f"Failed to fetch {page_path}: {e}")

print(f"\nCrawled {len(pages_html)} pages in total.")
print(f"Found {len(discovered_assets)} initial assets.")

# Save raw pages map
with open("pages_manifest.txt", "w", encoding="utf-8") as f:
    for p in sorted(pages_html.keys()):
        f.write(f"{p}\n")
