import os
import re

for fname in os.listdir("_next/static/chunks"):
    if fname.endswith(".js"):
        p = os.path.join("_next/static/chunks", fname)
        with open(p, "r", encoding="utf-8", errors="ignore") as fp:
            txt = fp.read()
        ms = set(re.findall(r'[a-zA-Z0-9_\-./@:]*(?:tecton|modulify)[a-zA-Z0-9_\-./@:]*', txt, re.I))
        if ms:
            print(f"\n{fname}:")
            for m in sorted(ms):
                print("  ", m)
