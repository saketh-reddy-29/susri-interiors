import re

with open("raw_index.html", "r", encoding="utf-8") as f:
    html = f.read()

print("Title match:")
for m in re.finditer(r'<title>(.*?)</title>', html, re.I):
    print(m.group(0))

print("\nMeta generator / framework:")
for m in re.finditer(r'<meta[^>]*>', html, re.I):
    if 'generator' in m.group(0).lower() or 'framework' in m.group(0).lower():
        print(m.group(0))

print("\nStylesheets:")
for m in re.finditer(r'<link[^>]*rel=["\']stylesheet["\'][^>]*>', html, re.I):
    print(m.group(0)[:150])

print("\nScripts count:")
scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', html, re.I)
print(f"External scripts: {len(scripts)}")
for s in scripts[:10]:
    print("  ", s)

images = re.findall(r'src=["\']([^"\']+\.(?:png|jpg|jpeg|svg|webp|gif))["\']', html, re.I)
images += re.findall(r'srcset=["\']([^"\']+)["\']', html, re.I)
print(f"\nImages found: {len(images)}")
for img in images[:10]:
    print("  ", img)
