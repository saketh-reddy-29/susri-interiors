import urllib.request
import urllib.parse
import re
import os
import json

base_url = "https://tecton-arch-tempalte.modulify.website"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# Pages we know so far
pages_to_visit = {
    "/",
    "/about",
    "/archive",
    "/archive/basalt-ridge",
    "/archive/camber",
    "/archive/lumina",
    "/archive/ochre",
    "/archive/quarry-studio",
    "/archive/sable",
    "/archive/vellum",
    "/archive/villa-forma",
    "/contact",
    "/enquiries",
    "/journal",
    "/journal/defining-spatial-restraint-with-lead-architect-evelyn-cross",
    "/journal/engineering-the-architecture-of-silence-through-spatial-restraint",
    "/journal/structuring-the-physical-archive-for-future-architectural-studies",
    "/legal/privacy-policy",
    "/legal/terms-of-service",
    "/practice/bespoke-curation",
    "/practice/custom-fabrication",
    "/practice/interior-architecture",
    "/practice/turnkey-execution"
}

visited = set()
all_assets = set()
page_contents = {}

for p in list(pages_to_visit):
    url = base_url + p
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8')
            page_contents[p] = html
            print(f"Downloaded {p} ({len(html)} bytes)")
            
            # Find links
            links = re.findall(r'href=["\']([^"\']+)["\']', html)
            for link in links:
                if link.startswith('/') and not link.startswith('//') and not link.startswith('/_next'):
                    # page link
                    clean_link = link.split('?')[0].split('#')[0]
                    if clean_link and clean_link not in pages_to_visit:
                        print(f"Discovered new page: {clean_link}")
                        pages_to_visit.add(clean_link)
    except Exception as e:
        print(f"Error fetching {p}: {e}")

print(f"\nTotal pages downloaded: {len(page_contents)}")
with open("site_manifest.json", "w", encoding="utf-8") as f:
    json.dump(list(page_contents.keys()), f, indent=2)
