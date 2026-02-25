# Fix hard-coded ports in all example configs

$configs = @(
  "g:\jen.js\examples\blog\jen.config.ts",
  "g:\jen.js\examples\landing-page\jen.config.ts",
  "g:\jen.js\examples\script-optimization\jen.config.ts",
  "g:\jen.js\examples\with-jsondb\jen.config.ts",
  "g:\jen.js\examples\with-tailwind\jen.config.ts",
  "g:\jen.js\examples\with-v13\jen.config.ts",
  "g:\jen.js\examples\with-v14\jen.config.ts",
  "g:\jen.js\examples\with-v15\jen.config.ts",
  "g:\jen.js\examples\with-v16\jen.config.ts",
  "g:\jen.js\examples\with-v17\jen.config.ts"
)

foreach ($config in $configs) {
  if (Test-Path $config) {
    Write-Host "Fixing: $config"
    $content = Get-Content $config -Raw
    
    # Replace all hard-coded port numbers with dynamic allocation
    $content = $content -replace 'port:\s*\d+,', 'port: process.env.PORT ? parseInt(process.env.PORT) : 0,'
    
    Set-Content $config $content -Encoding UTF8
    Write-Host "  Done"
  }
}

Write-Host "Port fix complete!"
