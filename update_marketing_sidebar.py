import os
import re

root = r"c:\github\thrivestack-documentation"

for dirpath, dirnames, filenames in os.walk(root):
    if '.git' in dirpath:
        continue
    for filename in filenames:
        if filename.endswith('.html'):
            filepath = os.path.join(dirpath, filename)
            
            rel_path = os.path.relpath(filepath, root)
            depth = len(rel_path.split(os.sep)) - 1
            prefix = "../" * depth if depth > 0 else "./" if depth == 0 else ""
            if depth == 0: prefix = ""
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
                continue
                
            original = content
            
            setup_ai_cls = "nav-item active" if filename == "setup-with-ai.html" and "marketing" in filepath.replace("\\", "/").lower() else "nav-item"
            impl_prompt_cls = "nav-item active" if filename == "implement-with-prompt-marketing.html" else "nav-item"
            goal_conv_cls = "nav-item active" if filename == "goal-conversion.html" else "nav-item"
            google_ads_cls = "nav-item active" if filename == "google-ads.html" else "nav-item"

            new_block = f"""<h3>Marketing Intelligence</h3>
                <ul>
                    <li><a href="{prefix}public/marketing/setup/setup-with-ai.html" class="{setup_ai_cls}"><span>Setup with AI (LLM)</span><span class="time-badge">2 mins</span></a></li>
                    <li><a href="#" class="nav-item"><span>Setup Manually</span><span class="time-badge">10 mins</span></a></li>
                    <li><a href="{prefix}public/marketing/setup/implement-with-prompt-marketing.html" class="{impl_prompt_cls}"><span>Implement with Prompt</span></a></li>
                    <li><a href="{prefix}public/marketing/setup/goal-conversion.html" class="{goal_conv_cls}"><span>Goal Conversion</span></a></li>
                    <li><a href="{prefix}public/marketing/setup/google-ads.html" class="{google_ads_cls}"><span>Google Ads</span></a></li>
                </ul>"""

            content = re.sub(r'<h3>Marketing Intelligence</h3>\s*<ul>.*?</ul>', new_block, content, flags=re.IGNORECASE | re.DOTALL)
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
