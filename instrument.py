import os
import re

directory = r"c:\github\thrivestack-documentation"

# Read .env file manually
env_file = os.path.join(directory, '.env')
api_key = ''
if os.path.exists(env_file):
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('THRIVESTACK_MARKETING_API_KEY='):
                api_key = line.strip().split('=', 1)[1]

if not api_key:
    print("API key not found in .env")
    exit(1)

script_tag = f"""    <script
        src="https://cdn.app.thrivestack.ai/latest/script.js"
        api-key="{api_key}"
        source="marketing">
    </script>
"""

# Regex to match any existing thrivestack script tag
existing_script_re = re.compile(r'\s*<script[^>]*src=["\']https://cdn\.app\.thrivestack\.ai/latest/script\.js["\'][^>]*>(?:</script>)?', re.IGNORECASE)

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Remove existing thrivestack tags
            new_content = existing_script_re.sub('', content)

            # Insert new script tag right before </head>
            if '</head>' in new_content:
                new_content = new_content.replace('</head>', script_tag + '</head>')
            else:
                # If no </head>, just prepend to content (fallback)
                new_content = script_tag + new_content
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

print("Updated all HTML files.")
