$root = "c:\github\thrivestack-documentation"
$files = Get-ChildItem -Path $root -Recurse -Filter "*.html" | Where-Object { $_.FullName -notmatch "\\.git" }

foreach ($f in $files) {
    if ($f.Name -match "marketing_home") { continue }
    
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $original = $content

    $relPath = $f.FullName.Substring($root.Length).Trim('\', '/')
    $depth = ($relPath.Split([char[]]@('\', '/'), [StringSplitOptions]::RemoveEmptyEntries)).Length - 1
    
    $prefix = ""
    for ($i = 0; $i -lt $depth; $i++) {
        $prefix += "../"
    }

    $setupWithAiCls = "nav-item"
    $saasCls = "nav-item"
    $vibeCls = "nav-item"

    if ($f.Name -eq "setup-with-ai.html" -and $f.FullName -match "product") {
        $setupWithAiCls = "nav-item active"
    } elseif ($f.Name -eq "saas-growth-events.html") {
        $saasCls = "nav-item active"
    } elseif ($f.Name -eq "vibe-analytics.html") {
        $vibeCls = "nav-item active"
    }

    $newBlock = "<h3>Product Intelligence</h3>`n                <ul>`n                    <li><a href=`"$prefix`public/product/setup/setup-with-ai.html`" class=`"$setupWithAiCls`"><span>Setup with AI</span><span class=`"time-badge`">2 mins</span></a></li>`n                    <li><a href=`"#`" class=`"nav-item`"><span>Setup Manually</span><span class=`"time-badge`">~1hr</span></a></li>`n                    <li><a href=`"$prefix`public/product/setup/saas-growth-events.html`" class=`"$saasCls`"><span>Understand Events Telemetry</span></a></li>`n                    <li><a href=`"$prefix`public/product/setup/vibe-analytics.html`" class=`"$vibeCls`"><span>Instructions</span></a></li>`n                </ul>"

    $content = [regex]::Replace($content, "(?s)<h3>Product Intelligence</h3>\s*<ul>.*?</ul>", $newBlock, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Updated $($f.FullName)"
    }
}
