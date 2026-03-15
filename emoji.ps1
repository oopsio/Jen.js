[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Regex for emojis (Surrogate pairs and symbols)
$emojiRegex = '[\uD83C-\uD83E][\uDC00-\uDFFF]|[\u2600-\u27BF]'

# Extensions to skip (to avoid binary garbage)
$skipExt = @('.ttf', '.woff', '.woff2', '.pdf', '.png', '.jpg', '.exe', '.dll', '.zip', '.pyc', '.ico')

Get-ChildItem -Recurse -File | Where-Object {
    $path = $_.FullName
    $ext = $_.Extension.ToLower()
    if ($skipExt -contains $ext) { return $false }

    # Skip agent skills - do NOT modify
    if ($path -match '\.agents\\skills\\') { return $false }

    # Skip node_modules, dist, lib, and anything inside apps/
    if ($path -match '\\node_modules\\' -or 
        $path -match '\\dist\\' -or 
        $path -match '\\lib\\' -or 
        $path -match '\\apps\\[^\\]+\\') { 
        return $false 
    }
    return $true
} | ForEach-Object {
    try {
        # Using .NET to read lines reliably
        $lines = [System.IO.File]::ReadAllLines($_.FullName, [System.Text.Encoding]::UTF8)
        
        $hasEmojis = $false
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ([regex]::IsMatch($lines[$i], $emojiRegex)) {
                # Remove emojis from this line
                $lines[$i] = [regex]::Replace($lines[$i], $emojiRegex, '')
                $hasEmojis = $true
            }
        }
        
        # If we found emojis, write the cleaned file back
        if ($hasEmojis) {
            [System.IO.File]::WriteAllLines($_.FullName, $lines, [System.Text.Encoding]::UTF8)
            Write-Host "Fixed: $($_.FullName)" -ForegroundColor Green
        }
    } catch {
        # Ignore files that can't be opened
    }
}
