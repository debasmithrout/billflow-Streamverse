import re

with open("c:/Users/debas/.gemini/antigravity/scratch/billflow_frontend/src/pages/admin/Analytics.jsx", "r", encoding="utf-8") as f:
    code = f.read()

start_idx = code.find("return (")
return_block = code[start_idx:]

tags = []
for m in re.finditer(r'<div[^>]*>|</div>', return_block):
    text = m.group(0)
    pos = m.start()
    line_no = return_block[:pos].count('\n') + 1 + 359 # Offset to line number in file
    tags.append((text, line_no))

stack = []
for tag, line in tags:
    if tag.startswith("<div"):
        stack.append((tag, line))
    else:
        if stack:
            open_tag, open_line = stack.pop()
            print(f"Match: {open_tag[:30]} at line {open_line} matched by </div> at line {line}")
        else:
            print(f"ERROR: </div> at line {line} has no matching <div")

print("\n--- UNCLOSED TAGS IN STACK ---")
for tag, line in stack:
    print(f"UNCLOSED: {tag[:40]}... at line {line}")
