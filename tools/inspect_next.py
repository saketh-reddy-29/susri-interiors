import re
import json

with open("raw_index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Look for __NEXT_DATA__
m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
if m:
    data = json.loads(m.group(1))
    print("Found __NEXT_DATA__ keys:", list(data.keys()))
    print("Page:", data.get('page'))
    print("Props keys:", list(data.get('props', {}).keys()))
    print("Query:", data.get('query'))
    with open("next_data.json", "w", encoding="utf-8") as out:
        json.dump(data, out, indent=2)
    print("Wrote next_data.json")
else:
    print("No __NEXT_DATA__ found. Checking for Turbopack/Next 13/14/15 App router script tags or self.__next_f...")
    app_chunks = re.findall(r'self\.__next_f\.push\((.*?)\)', html)
    print("self.__next_f chunks:", len(app_chunks))
