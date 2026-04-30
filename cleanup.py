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

# Regex to remove the exact old block and any orphaned </script> associated with it
# Actually, since we've already run the flawed script, we currently have:
# </script>
#     <script
#         src="https://cdn.app.thrivestack.ai/latest/script.js"
#         api-key="i1rPJo38lB6hR2qZC5iNNz0xcGRuBYIKRVYfTBdpJyY="
#         source="marketing">
#     </script>
#
# Let's just remove ALL script tags related to thrivestack, and their preceding/following whitespace and trailing </script> tags.
# A safe way is to match the current thrivestack script, and also any orphaned `</script>` right before it.

thrivestack_re = re.compile(r'(?:</script>\s*)?<script[^>]*src=["\']https://cdn\.app\.thrivestack\.ai/latest/script\.js["\'][^>]*>\s*</script>', re.IGNORECASE | re.DOTALL)

# And another one for the case where it was the variable `%THRIVESTACK_MARKETING_API_KEY%`
old_thrivestack_re = re.compile(r'(?:</script>\s*)?<script[^>]*src=["\']https://cdn\.app\.thrivestack\.ai/latest/script\.js["\'][^>]*>\s*(?:</script>)?', re.IGNORECASE | re.DOTALL)


for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # First, try to remove the specific messy blocks.
            # It's safest to just remove the specific newly injected block, and any preceding orphaned </script>
            new_content = re.sub(r'\s*</script>\s*<script\s+src="https://cdn\.app\.thrivestack\.ai/latest/script\.js"[^>]*>\s*</script>', '', content, flags=re.IGNORECASE)
            
            # Also remove any clean injections just in case
            new_content = re.sub(r'\s*<script\s+src="https://cdn\.app\.thrivestack\.ai/latest/script\.js"[^>]*>\s*</script>', '', new_content, flags=re.IGNORECASE)

            # Insert new script tag right before </head>
            if '</head>' in new_content:
                new_content = new_content.replace('</head>', script_tag + '</head>')
            else:
                # If no </head>, just prepend to content (fallback)
                new_content = script_tag + new_content
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

print("Cleaned up and updated all HTML files with actual API key.")
