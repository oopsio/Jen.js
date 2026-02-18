# Use the official Node.js LTS image as the base
FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install essential build tools and development dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-dev \
    git \
    curl \
    wget \
    unzip \
    ripgrep \
    jq \
    ca-certificates \
    fonts-dejavu \
    xfonts-75dpi \
    xfonts-100dpi \
    fontconfig \
    libfontconfig1 \
    apt-transport-https \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally (version from package.json)
RUN npm install -g pnpm@9.0.0

# Create pnpm global bin directory
RUN mkdir -p /usr/local/pnpm && chown -R node:node /usr/local/pnpm

# Set pnpm store location for caching efficiency
ENV PNPM_HOME=/home/node/.pnpm
ENV PATH="${PNPM_HOME}:$PATH"

# Create .pnpm-store directory with proper permissions
RUN mkdir -p /home/node/.pnpm-store && chown -R node:node /home/node/.pnpm-store

# Configure pnpm for better performance in containers
RUN pnpm config set store-dir /home/node/.pnpm-store

# Enable pnpm shell completions
RUN pnpm install-completion bash

# Switch to node user
USER node

# Set working directory (will be overridden by devcontainer mount)
WORKDIR /workspace

# Health check to ensure container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version && pnpm --version && git --version || exit 1
