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

    $setupAiCls = "nav-item"
    $implPromptCls = "nav-item"

    if ($f.Name -eq "setup-with-ai.html" -and $f.FullName -match "marketing") {
        $setupAiCls = "nav-item active"
    } elseif ($f.Name -eq "implement-with-prompt-marketing.html") {
        $implPromptCls = "nav-item active"
    }

    $newBlock = "<h3>Marketing Intelligence</h3>`n                <ul>`n                    <li><a href=`"$prefix`public/marketing/setup/setup-with-ai.html`" class=`"$setupAiCls`"><span>Setup with AI (LLM)</span><span class=`"time-badge`">2`n                                mins</span></a></li>`n                    <li><a href=`"#`" class=`"nav-item`"><span>Setup Manually</span><span class=`"time-badge`">10`n                                mins</span></a></li>`n                    <li><a href=`"$prefix`public/marketing/setup/implement-with-prompt-marketing.html`"`n                            class=`"$implPromptCls`"><span>Implement with Prompt</span></a></li>`n                </ul>"

    $content = [regex]::Replace($content, "(?s)<h3>Marketing Intelligence</h3>\s*<ul>.*?</ul>", $newBlock, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Updated $($f.FullName)"
    }
}
