import os
import re

root_dir = r"c:\github\thrivestack-documentation"

# Regex to match the entire aside block for the sidebar
# We use non-greedy matching to capture the aside block
aside_re = re.compile(r'<aside\s+class="left-sidebar"\s+id="sidebar">.*?</aside>', re.DOTALL | re.IGNORECASE)

updated_count = 0

for root, dirs, files in os.walk(root_dir):
    if '.git' in root: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            
            # calculate prefix
            rel_path = os.path.relpath(filepath, root_dir)
            depth = len(rel_path.split(os.sep)) - 1
            prefix = "../" * depth if depth > 0 else "./" if depth == 0 else ""
            if depth == 0: prefix = ""
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            
            # Find all aside blocks
            def replace_aside(match):
                block = match.group(0)
                # Only replace if this is the Setup (Unify) sidebar
                # We can identify it if it contains "Setup (Unify) Overview" or "ThriveStack MCP"
                if "Setup (Unify) Overview" in block or "ThriveStack MCP" in block or "Marketing Intelligence" in block:
                    return f'<setup-sidebar id="sidebar" class="left-sidebar" base-path="{prefix}"></setup-sidebar>'
                return block
            
            new_content = aside_re.sub(replace_aside, content)
            
            if new_content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                updated_count += 1
                print(f"Componentized {filepath}")

print(f"Updated {updated_count} files.")
