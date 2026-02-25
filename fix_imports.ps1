$files = Get-ChildItem -Path "g:\jen.js\src" -Filter "*.ts" -Recurse | Where-Object { Select-String -Pattern "@src/" -Path $_.FullName -Quiet }

foreach ($file in $files) {
  Write-Host "Processing: $($file.FullName)"
  $content = Get-Content $file.FullName -Raw
  $content = $content -replace '@src/', '../'
  Set-Content $file.FullName $content -Encoding UTF8
  Write-Host "Fixed: $($file.FullName)"
}
