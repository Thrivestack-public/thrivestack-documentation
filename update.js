const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory() && !file.includes('.git')) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function processFiles(files) {
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    let updatedCount = 0;
    
    htmlFiles.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // 1. Update Top Navbar for Setup(Unify)
        if (content.includes('nav-links')) {
            content = content.replace(/href="vibe-analytics.html"/g, 'href="setup-overview.html"');
            content = content.replace(/href="[^"]*setup-overview.html"/g, 'href="setup-overview.html"');
            
            // Adjust paths dynamically based on file depth
            const relDepth = file.split('thrivestack-documentation')[1].split(/\\|\//).length - 2;
            const prefix = relDepth > 0 ? '../'.repeat(relDepth) : '';
            
            content = content.replace(/href="setup-overview.html"/g, `href="${prefix}setup-overview.html"`);
            // But actually this might double prefix if it's already there. Let's do a simpler regex replace:
            // Since links are mostly relative.
        }

        // We will just do a stupidly simple replace assuming flat or simply prefix relative.
        // Let's reset approach to make it bulletproof without needing prefix for root files and with prefix for nested.
        let relDepth = file.split('thrivestack-documentation')[1].split(/\\|\//).length - 2;
        if (relDepth < 0) relDepth = 0;
        let pfx = relDepth > 0 ? '../'.repeat(relDepth) : '';

        // Safely replace topnav link for setup
        content = content.replace(/<a href="[^"]*vibe-analytics.html"([^>]*)>Setup \(Unify\)<\/a>/g, `<a href="${pfx}setup-overview.html"$1>Setup (Unify)</a>`);

        // 2. Add Overview section to left pane above Marketing Intelligence
        if (content.includes('<div class="sidebar-section">') && !content.includes('<h3>Overview</h3>')) {
            const overviewSection = `            <div class="sidebar-section">
                <h3>Overview</h3>
                <ul>
                    <li><a href="${pfx}setup-overview.html" class="nav-item"><span>Setup (Unify) Overview</span></a></li>
                </ul>
            </div>\n\n`;
            // insert before the Marketing Intelligence section
            content = content.replace(/(<div class="sidebar-section">\s*<h3>Marketing Intelligence<\/h3>)/, overviewSection + '$1');
        }

        // 3. For Product Intelligence > Implement with Prompt point to Product/Setup/implement-with-prompt-product.html
        // The link currently points to implement-with-prompt.html or implement-with-prompt-product.html
        // And is nested inside Product Intelligence section.
        const productLinkReplacement = `<a href="${pfx}public/product/setup/implement-with-prompt-product.html"`;
        content = content.replace(/(<h3>Product Intelligence<\/h3>[\s\S]*?)<a href="[^"]*implement-with-prompt(?:-product)?\.html"/g, `$1${productLinkReplacement}`);

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log("Updated: " + file);
            updatedCount++;
        }
    });

    console.log(`Updated ${updatedCount} files.`);
}

walk('c:/github/thrivestack-documentation', function(err, results) {
  if (err) throw err;
  processFiles(results);
});
