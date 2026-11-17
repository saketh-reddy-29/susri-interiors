import urllib.request

base = "https://tecton-arch-tempalte.modulify.website"
build_id = "4K6ErJjSMXc7MHQ6sCgls"
headers = {'User-Agent': 'Mozilla/5.0'}

for path in [
    f"/_next/static/{build_id}/_buildManifest.js",
    f"/_next/static/{build_id}/_ssgManifest.js",
]:
    url = base + path
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            print(f"{path}: status 200, length {len(content)}")
            print(content[:500])
    except Exception as e:
        print(f"{path}: error {e}")
