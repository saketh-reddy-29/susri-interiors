import urllib.request
import re

build_id = "4K6ErJjSMXc7MHQ6sCgls"
base = "https://tecton-arch-tempalte.modulify.website"

# Get chunks from raw_index.html
with open("raw_index.html", "r", encoding="utf-8") as f:
    html = f.read()

scripts = re.findall(r'src=["\'](/_next/static/[^"\']+)["\']', html)
print(f"Found {len(scripts)} scripts in raw_index.html:")
for s in scripts:
    url = base + s
    try:
        content = urllib.request.urlopen(url).read().decode('utf-8', 'ignore')
        matches = re.findall(r'tecton|modulify', content, re.I)
        print(f"  {s} ({len(content)} bytes) -> matches: {len(matches)}")
        if matches:
            for m in re.finditer(r'.{0,30}(?:tecton|modulify).{0,30}', content, re.I):
                print("     snippet:", m.group(0))
    except Exception as e:
        print(f"  {s} -> error {e}")
