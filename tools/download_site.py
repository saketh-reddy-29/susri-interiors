import urllib.request
import re
import os

url = "https://tecton-arch-tempalte.modulify.website/?ref=landdding.com"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    html = resp.read().decode('utf-8')

with open("raw_index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Saved raw_index.html, length:", len(html))
