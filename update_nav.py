import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    rel_depth = max(0, len(filepath.split('thrivestack-documentation')[1].split(os.sep)) - 2)
    pfx = '../' * rel_depth
    if os.sep == '/':
        pass # Linux handling not strictly needed on windows, but rel_depth is robust

    # 1. Update top nav link for "Setup (Unify)"
    top_nav_pattern = re.compile(r'<a href="[^"]*vibe-analytics.html"([^>]*)>Setup \(Unify\)</a>', re.IGNORECASE)
    content = top_nav_pattern.sub(f'<a href="{pfx}setup-overview.html"\\1>Setup (Unify)</a>', content)

    # 2. Add 'Overview' section dynamically into the sidebar above 'Marketing Intelligence'
    sidebar_pattern = re.compile(r'(<div class="sidebar-section">\s*<h3>Marketing Intelligence</h3>)', re.IGNORECASE)
    if '<h3>Overview</h3>' not in content:
        overview_html = f'<div class="sidebar-section">\n                <h3>Overview</h3>\n                <ul>\n                    <li><a href="{pfx}setup-overview.html" class="nav-item"><span>Setup (Unify) Overview</span></a></li>\n                </ul>\n            </div>\n\n            \\1'
        content = sidebar_pattern.sub(overview_html, content)

    # 3. Product Intelligence -> Implement with Prompt -> prompt-product.html
    prod_intel_pattern = re.compile(r'(<h3>Product Intelligence</h3>\s*<ul>(?:(?!</div>)[\s\S])*?)<a href="[^"]*implement-with-prompt(?:-product)?\.html"(.*?>\s*<span.*?>Implement with Prompt</span>\s*</a>)', re.IGNORECASE)
    content = prod_intel_pattern.sub(f'\\1<a href="{pfx}public/product/setup/implement-with-prompt-product.html"\\2', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(r'c:\github\thrivestack-documentation'):
    if '.git' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            process_file(os.path.join(root, file))
