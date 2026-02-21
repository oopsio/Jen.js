$root = Get-Location

# Helper function to check if a file is likely text
function Is-TextFile {
    param([string]$Path)
    try {
        $bytes = Get-Content $Path -Encoding Byte -ReadCount 1024
        foreach ($b in $bytes) {
            if ($b -lt 9 -or ($b -gt 13 -and $b -lt 32)) {
                return $false
            }
        }
        return $true
    } catch {
        return $false
    }
}

# Get all files recursively except ignored folders
Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\(node_modules|dist|\.next|\.esbuild|\.nuxt|\.jen|\.svelte-kit)\\'
} | ForEach-Object {

    $file = $_.FullName

    if (-not (Is-TextFile $file)) { return }  # skip binaries

    $lines = Get-Content $file -ErrorAction SilentlyContinue
    if ($lines.Count -eq 0) { return }

    # Find the first line with shebang
    $shebangIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^#!') {
            $shebangIndex = $i
            break
        }
    }

    # If shebang exists and something is above it
    if ($shebangIndex -gt 0) {
        $newContent = $lines[$shebangIndex..($lines.Count - 1)]
        Set-Content -Path $file -Value $newContent -NoNewline

        # Output relative path
        $relativePath = $file.Substring($root.Path.Length + 1)
        Write-Output $relativePath
    }
}