#!/bin/bash

# Jen.js Development Container - Initialize Command
# This script runs before the container is created

set -e

echo " Initializing dev container environment..."

# Clean up any leftover Docker artifacts that might cause issues
if [ -f ".devcontainer/.env" ]; then
    export $(cat .devcontainer/.env | xargs)
fi

echo " Initialization complete"
