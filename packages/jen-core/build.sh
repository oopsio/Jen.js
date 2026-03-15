#!/bin/bash
# Build Go source to WebAssembly

set -e

# Create output directory
mkdir -p src/vendor

# Copy wasm_exec.js from Go standard library
GOROOT=$(go env GOROOT)
WASM_EXEC_SRC="$GOROOT/misc/wasm/wasm_exec.js"
WASM_EXEC_DST="src/vendor/wasm_exec.js"

if [ -f "$WASM_EXEC_SRC" ]; then
    cp "$WASM_EXEC_SRC" "$WASM_EXEC_DST"
    echo "Copied wasm_exec.js from $GOROOT"
else
    echo "Warning: wasm_exec.js not found at $WASM_EXEC_SRC"
fi

# Build WASM binary
GOOS=js GOARCH=wasm go build -o src/vendor/engine.wasm .

echo "Built engine.wasm successfully"
