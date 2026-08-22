with open("c:/Users/debas/.gemini/antigravity/scratch/billflow_frontend/src/pages/admin/Analytics.jsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

for match in re.finditer(r'}', code):
    pos = match.start()
    start = max(0, pos - 30)
    end = min(len(code), pos + 30)
    context = code[start:end].replace('\n', ' ')
    context_clean = "".join(c for c in context if ord(c) < 128)
    print(f"Pos {pos}: ... {context_clean} ...")
