//! Plugin trait and system

use crate::context::PluginContext;
use crate::error::Result;
use crate::middleware::MiddlewareHandler;
use crate::route::RouteConfig;
use serde_json::Value;

/// Core plugin trait - powerful and flexible
pub trait Plugin: Send + Sync {
    /// Plugin name (unique identifier)
    fn name(&self) -> &str;

    /// Plugin version
    fn version(&self) -> &str {
        "0.0.1"
    }

    /// Plugin description
    fn description(&self) -> &str {
        "A Jen.js plugin"
    }

    // Lifecycle hooks

    /// Called when plugin is initialized
    fn on_init(&self, _context: &PluginContext) -> Result<()> {
        Ok(())
    }

    /// Called when plugin is destroyed
    fn on_destroy(&self) -> Result<()> {
        Ok(())
    }

    // Configuration hooks

    /// Modify build configuration
    fn resolve_config(&self, _config: Value) -> Result<Value> {
        Ok(_config)
    }

    /// Resolve module ID
    fn resolve_id(&self, _id: &str) -> Result<Option<String>> {
        Ok(None)
    }

    /// Load resolved module
    fn load(&self, _id: &str) -> Result<Option<String>> {
        Ok(None)
    }

    // Route hooks

    /// Resolve and modify routes
    fn resolve_route(&self, _config: &RouteConfig) -> Result<Option<RouteConfig>> {
        Ok(None)
    }

    /// Transform route configuration
    fn transform_route(&self, _config: &mut RouteConfig) -> Result<()> {
        Ok(())
    }

    // Middleware hooks

    /// Provide custom middleware
    fn get_middleware(&self) -> Result<Vec<MiddlewareHandler>> {
        Ok(Vec::new())
    }

    // Build hooks

    /// Called after build completes
    fn on_build_complete(&self, _result: &BuildResult) -> Result<()> {
        Ok(())
    }

    /// Called before build starts
    fn on_build_start(&self) -> Result<()> {
        Ok(())
    }
}

/// Build result information
#[derive(Debug, Clone)]
pub struct BuildResult {
    pub output_dir: String,
    pub duration: u64,
    pub success: bool,
    pub errors: Vec<String>,
}

impl BuildResult {
    pub fn new(output_dir: String, duration: u64) -> Self {
        Self {
            output_dir,
            duration,
            success: true,
            errors: Vec::new(),
        }
    }

    pub fn with_error(mut self, error: String) -> Self {
        self.errors.push(error);
        self.success = false;
        self
    }
}

/// Plugin metadata
#[derive(Debug, Clone)]
pub struct PluginMetadata {
    pub name: String,
    pub version: String,
    pub description: String,
    pub hooks: Vec<&'static str>,
}

impl PluginMetadata {
    /// Create metadata from plugin
    pub fn from_plugin(plugin: &dyn Plugin) -> Self {
        Self {
            name: plugin.name().to_string(),
            version: plugin.version().to_string(),
            description: plugin.description().to_string(),
            hooks: Vec::new(),
        }
    }

    /// Check if plugin implements hook
    pub fn has_hook(&self, hook: &str) -> bool {
        self.hooks.contains(&hook)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TestPlugin;

    impl Plugin for TestPlugin {
        fn name(&self) -> &str {
            "test-plugin"
        }

        fn version(&self) -> &str {
            "1.0.0"
        }
    }

    #[test]
    fn test_plugin_metadata() {
        let plugin = TestPlugin;
        let meta = PluginMetadata::from_plugin(&plugin);

        assert_eq!(meta.name, "test-plugin");
        assert_eq!(meta.version, "1.0.0");
    }
}
