import os
import re

text_matches = set()
for fname in os.listdir("raw_pages"):
    with open(f"raw_pages/{fname}", "r", encoding="utf-8") as f:
        html = f.read()
    # Strip classes
    no_class = re.sub(r'class="[^"]*"', '', html)
    for m in re.finditer(r'.{0,30}(?:tecton|modulify).{0,30}', no_class, re.I):
        text_matches.add(m.group(0).strip())

print(f"Unique non-class matches: {len(text_matches)}")
for t in sorted(text_matches):
    print("  ", t)
