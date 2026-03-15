# Build Go source to WebAssembly (Windows)

# Create output directory
New-Item -ItemType Directory -Force -Path "src\vendor" | Out-Null

# Copy wasm_exec.js from Go standard library
$goRoot = go env GOROOT
$wasmExecSrc = "$goRoot\misc\wasm\wasm_exec.js"
$wasmExecDst = "src\vendor\wasm_exec.js"

if (Test-Path $wasmExecSrc) {
    Copy-Item -Path $wasmExecSrc -Destination $wasmExecDst -Force
    Write-Host "Copied wasm_exec.js from $goRoot"
} else {
    Write-Host "Warning: wasm_exec.js not found at $wasmExecSrc"
}

# Build WASM binary
$env:GOOS = "js"
$env:GOARCH = "wasm"

go build -o src/vendor/engine.wasm .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Built engine.wasm successfully"
} else {
    Write-Host "Build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
