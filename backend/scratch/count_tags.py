with open("c:/Users/debas/.gemini/antigravity/scratch/billflow_frontend/src/pages/admin/Analytics.jsx", "r", encoding="utf-8") as f:
    code = f.read()

# Let's find return ( ... ) block
start_idx = code.find("return (")
return_block = code[start_idx:]

div_opens = return_block.count("<div")
div_closes = return_block.count("</div")

print("Div Opens:", div_opens)
print("Div Closes:", div_closes)
