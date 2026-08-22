import re

with open("c:/Users/debas/.gemini/antigravity/scratch/billflow_frontend/src/pages/admin/Analytics.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Strip multi-line comments /* ... */
code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
# Strip single-line comments // ...
code = re.sub(r'//.*?\n', '\n', code)
# Strip string literals (double quotes, single quotes, backticks)
# Be careful with escaped quotes, but we don't have many
code = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', code)
code = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", code)
# We won't strip backticks completely because they might contain JSX expressions, but let's count braces in what remains

brace_stack = []
paren_stack = []

for idx, char in enumerate(code):
    if char == "{":
        brace_stack.append(idx)
    elif char == "}":
        if brace_stack:
            brace_stack.pop()
        else:
            print(f"Extra closing brace at position {idx}")
    elif char == "(":
        paren_stack.append(idx)
    elif char == ")":
        if paren_stack:
            paren_stack.pop()
        else:
            print(f"Extra closing parenthesis at position {idx}")

print("Remaining braces in stack:", len(brace_stack))
print("Remaining parentheses in stack:", len(paren_stack))
if brace_stack:
    for pos in brace_stack:
        # print context around the unclosed brace
        start = max(0, pos - 40)
        end = min(len(code), pos + 40)
        print(f"Unclosed brace at position {pos}: {code[start:end]}")
if paren_stack:
    for pos in paren_stack:
        start = max(0, pos - 40)
        end = min(len(code), pos + 40)
        print(f"Unclosed parenthesis at position {pos}: {code[start:end]}")
