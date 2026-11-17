import re
from bs4 import BeautifulSoup

with open("raw_index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find all href
hrefs = set(re.findall(r'href=["\']([^"\']+)["\']', html))
print("All unique hrefs:")
for h in sorted(hrefs):
    print("  ", h)
