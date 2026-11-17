import os
import re
import urllib.parse
from pathlib import Path

rebrand_map = {
    "Tecton Arch": "SUSRI INTERIORS",
    "TECTON ARCH": "SUSRI INTERIORS",
    "studio@tectonarch.com": "studio@susriinteriors.com",
    "press@tectonarch.com": "press@susriinteriors.com",
    "workshop@tectonarch.com": "workshop@susriinteriors.com",
    "careers@tectonarch.com": "careers@susriinteriors.com",
    "tectonarch.com": "susriinteriors.com",
    "tecton-arch-tempalte": "susri-interiors",
    "Crafted by Shouvik": "Crafted for SUSRI INTERIORS"
}

def clean_html(html):
    # Remove Modulify analytics script
    html = re.sub(r'<script[^>]*analytics\.modulify\.ai[^>]*></script>', '', html, flags=re.I)
    
    # Remove Modulify badge styles
    html = re.sub(r'<style>\[data-modulify-badge\].*?</style>', '', html, flags=re.I|re.S)
    html = re.sub(r'<style>html\[data-mdlfy-embedded\].*?</style>', '', html, flags=re.I|re.S)
    
    # Remove Modulify badge check script
    html = re.sub(r'<script>\(function\(\)\{try\{if\(window\.top===window\.self\)return;.*?\}\(\)</script>', '', html, flags=re.I|re.S)
    
    # Remove any remaining script containing modulify
    html = re.sub(r'<script[^>]*>[^<]*modulify\.ai[^<]*</script>', '', html, flags=re.I|re.S)
    
    # Remove Modulify badge anchor tag
    html = re.sub(r'<a href="https://modulify\.ai/dashboard/templates/[^"]*"[^>]*data-modulify-badge="1".*?</a>', '', html, flags=re.I|re.S)
    
    # Replace generator meta
    html = re.sub(r'<meta name="generator" content="Modulify"/>', '<meta name="generator" content="SUSRI INTERIORS"/>', html)
    
    # Rebrand text
    for k, v in rebrand_map.items():
        html = html.replace(k, v)
        
    # Standalone Tecton in text and title
    html = re.sub(r'(?<![a-zA-Z0-9_\-])Tecton(?![a-zA-Z0-9_\-])', 'SUSRI INTERIORS', html)
    
    # Fix image URLs from /_next/image?url=%2Fimages%2F...
    def fix_next_image_url(match):
        raw_url = urllib.parse.unquote(match.group(1))
        return f'src="{raw_url}"'

    def fix_next_srcset(match):
        m_img = re.search(r'url=([^&"\']+)', match.group(0))
        if m_img:
            raw_url = urllib.parse.unquote(m_img.group(1))
            return f'srcSet="{raw_url}"'
        return ''

    html = re.sub(r'src=["\']/_next/image\?url=([^&"\']+)&amp;[^"\']*["\']', fix_next_image_url, html)
    html = re.sub(r'src=["\']/_next/image\?url=([^&"\']+)&[^"\']*["\']', fix_next_image_url, html)
    
    html = re.sub(r'srcSet=["\']/_next/image\?[^"\']*["\']', fix_next_srcset, html, flags=re.I)
    html = re.sub(r'srcset=["\']/_next/image\?[^"\']*["\']', fix_next_srcset, html, flags=re.I)
    
    return html

# Regenerate all pages
for fname in os.listdir("raw_pages"):
    if not fname.endswith(".html"):
        continue
    
    base_stem = fname[:-5]
    with open(f"raw_pages/{fname}", "r", encoding="utf-8") as f:
        html = f.read()
        
    cleaned = clean_html(html)
    
    if base_stem == "index":
        out_paths = ["index.html"]
    elif "__" in base_stem:
        parts = base_stem.split("__")
        folder = os.path.join(*parts)
        out_paths = [
            f"{folder}/index.html",
            f"{parts[0]}/{parts[1]}.html"
        ]
    else:
        out_paths = [
            f"{base_stem}/index.html",
            f"{base_stem}.html"
        ]
        
    for op in out_paths:
        p = Path(op)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as out_fp:
            out_fp.write(cleaned)

print("All HTML pages cleanly rewritten.")
