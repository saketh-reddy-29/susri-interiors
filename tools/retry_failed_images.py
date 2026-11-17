import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0'}
base = "https://tecton-arch-tempalte.modulify.website"

failed = [
    "/images/aura-loft-01.png",
    "/images/detail-aperture-5.jpg"
]

for img in failed:
    path = img.lstrip('/')
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        url = base + img
        print(f"Retrying {img}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                with open(path, "wb") as f:
                    f.write(data)
                print(f"Success {img}: {len(data)} bytes")
        except Exception as e:
            print(f"Failed {img}: {e}")
    else:
        print(f"Already exists: {img}")
