$root = "c:\github\thrivestack-documentation"
$files = Get-ChildItem -Path $root -Recurse -Filter "*.html" | Where-Object { $_.FullName -notmatch "\\.git" }

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $original = $content

    # 1. Fix the accidental backticks:
    $content = $content -replace '`<h3>', '<h3>'
    $content = $content -replace '<li>`<a href=', '<li><a href='
    $content = $content -replace 'product.html"` class=', 'product.html" class='

    # Determine depth relative to root
    $relPath = $f.FullName.Substring($root.Length).Trim('\', '/')
    $depth = ($relPath.Split([char[]]@('\', '/'), [StringSplitOptions]::RemoveEmptyEntries)).Length - 1
    
    $prefix = ""
    for ($i = 0; $i -lt $depth; $i++) {
        $prefix += "../"
    }

    # Helper function to prefix a specific href or src if it's not already prefixed
    function Add-Prefix {
        param ($text, $target, $pref)
        # Avoid double prefixing
        $text = [regex]::Replace($text, "(href|src)=`"((?:\.\./)*)$target`"", "`${1}=`"$pref$target`"", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        return $text
    }

    # Resources that exist ONLY at the root:
    $rootFiles = @(
        "styles.css",
        "script.js",
        "logo.png",
        "index.html",
        "vibe-analytics.html",
        "setup-overview.html",
        "analyze-signals.html",
        "take-action.html",
        "connect-your-stack.html",
        "analyze-correlated-signals.html",
        "drive-revenue-playbooks.html",
        "accelerate-free-to-paid.html",
        "spot-expansion-signals.html",
        "stop-churn-early.html",
        "implement-with-prompt.html"
    )

    foreach ($rf in $rootFiles) {
        $content = Add-Prefix -text $content -target $rf -pref $prefix
    }

    # Now fix links pointing TO the subfolder pages
    # These pages only exist in their respective subfolders
    $subpages = @{
        "saas-growth-events.html" = "public/product/setup/saas-growth-events.html";
        "implement-with-prompt-product.html" = "public/product/setup/implement-with-prompt-product.html";
        "implement-with-prompt-marketing.html" = "public/marketing/setup/implement-with-prompt-marketing.html"
    }

    foreach ($page in $subpages.GetEnumerator()) {
        # what should the link be from *this* file's current depth?
        # The correct path from this file is $prefix + $page.Value
        $correctPath = $prefix + $page.Value
        
        # Replace occurrences of href="pageName" or href="../../pageName" with the fully corrected path
        $content = [regex]::Replace($content, "href=`"(?:\.\./)*(?:public/[^/]*/setup/)?$($page.Name)`"", "href=`"$correctPath`"", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Fixed and saved: $($f.FullName)"
    }
}
