//! Configuration management

use crate::error::Result;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::path::PathBuf;

/// Build configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildConfig {
    pub target: BuildTarget,
    pub minify: bool,
    pub sourcemap: bool,
    pub optimize: bool,
    pub custom: HashMap<String, Value>,
}

impl Default for BuildConfig {
    fn default() -> Self {
        Self {
            target: BuildTarget::ESNext,
            minify: true,
            sourcemap: false,
            optimize: true,
            custom: HashMap::new(),
        }
    }
}

/// Build target
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BuildTarget {
    ESNext,
    ES2020,
    ES2015,
}

impl BuildTarget {
    pub fn as_str(&self) -> &str {
        match self {
            Self::ESNext => "esnext",
            Self::ES2020 => "es2020",
            Self::ES2015 => "es2015",
        }
    }
}

/// Server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub port: u16,
    pub host: String,
    pub https: bool,
    pub custom: HashMap<String, Value>,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            port: 3000,
            host: "localhost".to_string(),
            https: false,
            custom: HashMap::new(),
        }
    }
}

/// ISR (Incremental Static Regeneration) configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ISRConfig {
    pub enabled: bool,
    pub cache_dir: PathBuf,
    pub max_retries: u32,
    pub retry_delay: u64,
    pub global_revalidate: Option<u64>,
}

impl Default for ISRConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            cache_dir: PathBuf::from(".jen/cache"),
            max_retries: 3,
            retry_delay: 1000,
            global_revalidate: Some(3600),
        }
    }
}

/// Framework configuration
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FrameworkConfig {
    pub build: BuildConfig,
    pub server: ServerConfig,
    pub isr: ISRConfig,
    pub custom: HashMap<String, Value>,
}

impl FrameworkConfig {
    /// Create new config
    pub fn new() -> Self {
        Self::default()
    }

    /// Load from JSON file
    pub fn load_from_file(path: &PathBuf) -> Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let config: Self = serde_json::from_str(&content)
            .map_err(|e| crate::error::JenError::config(e.to_string()))?;
        Ok(config)
    }

    /// Merge with another config
    pub fn merge(&mut self, other: FrameworkConfig) {
        if other.build != self.build {
            self.build = other.build;
        }
        if other.server != self.server {
            self.server = other.server;
        }
        if other.isr != self.isr {
            self.isr = other.isr;
        }
        self.custom.extend(other.custom);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = FrameworkConfig::default();
        assert_eq!(config.server.port, 3000);
        assert!(config.isr.enabled);
    }

    #[test]
    fn test_build_target() {
        assert_eq!(BuildTarget::ESNext.as_str(), "esnext");
        assert_eq!(BuildTarget::ES2020.as_str(), "es2020");
    }
}

impl PartialEq for BuildConfig {
    fn eq(&self, other: &Self) -> bool {
        self.target == other.target
            && self.minify == other.minify
            && self.sourcemap == other.sourcemap
    }
}

impl PartialEq for ServerConfig {
    fn eq(&self, other: &Self) -> bool {
        self.port == other.port && self.host == other.host && self.https == other.https
    }
}

impl PartialEq for ISRConfig {
    fn eq(&self, other: &Self) -> bool {
        self.enabled == other.enabled
            && self.cache_dir == other.cache_dir
            && self.global_revalidate == other.global_revalidate
    }
}
