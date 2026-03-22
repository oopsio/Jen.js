//! Plugin context - provides framework access and metadata

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Plugin execution context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginContext {
    /// Plugin name
    pub name: String,

    /// Plugin version
    pub version: String,

    /// Framework version
    pub framework_version: String,

    /// Current environment
    pub environment: Environment,

    /// Root directory path
    pub root_dir: PathBuf,

    /// Build output directory
    pub build_dir: PathBuf,

    /// Configuration data
    pub config: HashMap<String, serde_json::Value>,

    /// Build metadata
    pub build_metadata: BuildMetadata,
}

/// Execution environment
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    Development,
    Production,
    Test,
}

impl Environment {
    pub fn is_dev(&self) -> bool {
        *self == Environment::Development
    }

    pub fn is_prod(&self) -> bool {
        *self == Environment::Production
    }

    pub fn is_test(&self) -> bool {
        *self == Environment::Test
    }
}

/// Build metadata
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BuildMetadata {
    pub start_time: Option<u64>,
    pub build_target: Option<String>,
    pub source_maps_enabled: bool,
    pub minify_enabled: bool,
    pub custom: HashMap<String, serde_json::Value>,
}

impl PluginContext {
    /// Create a new context
    pub fn new(
        name: impl Into<String>,
        version: impl Into<String>,
        framework_version: impl Into<String>,
        environment: Environment,
        root_dir: PathBuf,
        build_dir: PathBuf,
    ) -> Self {
        Self {
            name: name.into(),
            version: version.into(),
            framework_version: framework_version.into(),
            environment,
            root_dir,
            build_dir,
            config: HashMap::new(),
            build_metadata: BuildMetadata::default(),
        }
    }

    /// Set configuration value
    pub fn set_config(&mut self, key: String, value: serde_json::Value) {
        self.config.insert(key, value);
    }

    /// Get configuration value
    pub fn get_config(&self, key: &str) -> Option<&serde_json::Value> {
        self.config.get(key)
    }

    /// Check if running in development
    pub fn is_dev(&self) -> bool {
        self.environment.is_dev()
    }

    /// Check if running in production
    pub fn is_prod(&self) -> bool {
        self.environment.is_prod()
    }

    /// Get relative path within root
    pub fn resolve_path(&self, path: &str) -> PathBuf {
        self.root_dir.join(path)
    }

    /// Get relative path within build dir
    pub fn resolve_build_path(&self, path: &str) -> PathBuf {
        self.build_dir.join(path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plugin_context_creation() {
        let context = PluginContext::new(
            "test-plugin",
            "1.0.0",
            "1.0.0",
            Environment::Development,
            PathBuf::from("/app"),
            PathBuf::from("/app/dist"),
        );

        assert_eq!(context.name, "test-plugin");
        assert!(context.is_dev());
    }

    #[test]
    fn test_path_resolution() {
        let context = PluginContext::new(
            "test",
            "1.0.0",
            "1.0.0",
            Environment::Production,
            PathBuf::from("/app"),
            PathBuf::from("/app/dist"),
        );

        let path = context.resolve_path("src/main.rs");
        assert_eq!(path, PathBuf::from("/app/src/main.rs"));
    }
}
