import os
import re

chunks_dir = "_next/static/chunks"
matches = {}

for root, dirs, files in os.walk("_next/static"):
    for f in files:
        if f.endswith(".js"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8", errors="ignore") as fp:
                txt = fp.read()
            m = re.findall(r'tecton|modulify', txt, re.I)
            if m:
                matches[path] = len(m)
                print(f"{path}: {len(m)} matches")

print("Total files with matches:", len(matches))
