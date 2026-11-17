import json

with open("next_data.json", "r", encoding="utf-8") as f:
    d = json.load(f)

print("buildId:", d.get('buildId'))
print("pageProps keys:", list(d.get('props', {}).get('pageProps', {}).keys()))
print("pageProps content preview:", str(d.get('props', {}).get('pageProps'))[:500])
