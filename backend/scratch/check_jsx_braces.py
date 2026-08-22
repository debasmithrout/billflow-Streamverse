with open("c:/Users/debas/.gemini/antigravity/scratch/billflow_frontend/src/pages/admin/Analytics.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

output = []
brace_depth = 0
paren_depth = 0

for idx, line in enumerate(lines, 1):
    opens_b = line.count("{")
    closes_b = line.count("}")
    opens_p = line.count("(")
    closes_p = line.count(")")
    
    brace_depth += opens_b - closes_b
    paren_depth += opens_p - closes_p
    
    if opens_b or closes_b or opens_p or closes_p:
        line_clean = "".join(c for c in line.strip()[:40] if ord(c) < 128)
        output.append(f"Line {idx}: {line_clean} | B: {opens_b}/{closes_b} (depth {brace_depth}) | P: {opens_p}/{closes_p} (depth {paren_depth})")

output.append(f"Final depths - B: {brace_depth}, P: {paren_depth}")
with open("c:/Users/debas/.gemini/antigravity/scratch/billflow_backend/scratch/check_output_p.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))
print("Done checking!")
