$files = Get-ChildItem -Path "c:\github\thrivestack-documentation" -Recurse -Filter "*.html" | Where-Object { $_.FullName -notmatch "\\.git" }

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $original = $content

    $content = [regex]::Replace($content, 'href="([^"]*)vibe-analytics\.html"([^>]*)>Setup \(Unify\)</a>', 'href="$1setup-overview.html"$2>Setup (Unify)</a>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    if ($content -match '<div class="sidebar-section">\s*<h3>Marketing Intelligence</h3>') {
        if ($content -notmatch '<h3>Overview</h3>') {
            $replacement = "<div class=`"sidebar-section`">`n                <h3>Overview</h3>`n                <ul>`n                    <li><a href=`"$($matches[1])setup-overview.html`" class=`"nav-item`"><span>Setup (Unify) Overview</span></a></li>`n                </ul>`n            </div>`n`n            $1"
            # we don't have $matches[1] dynamically here without regex match evaluation, so we'll just determine prefix.
            
            # just use "setup-overview.html" for now, they seem to rely on flat structure or domain root routing.
            $content = [regex]::Replace($content, '(<div class="sidebar-section">\s*<h3>Marketing Intelligence</h3>)', "<div class=`"sidebar-section`">`n                <h3>Overview</h3>`n                <ul>`n                    <li><a href=`"setup-overview.html`" class=`"nav-item`"><span>Setup (Unify) Overview</span></a></li>`n                </ul>`n            </div>`n`n            `$1", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        }
    }

    $content = [regex]::Replace($content, '(<h3>Product Intelligence</h3>\s*<ul>.*?)(<a[^>]*href=")[^"]*implement-with-prompt[^"]*\.html"([^>]*>\s*<span>Implement with Prompt</span>\s*</a>)', '`$1`$2public/product/setup/implement-with-prompt-product.html"`$3', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Updated $($f.FullName)"
    }
}
