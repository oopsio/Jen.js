use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JenPackConfig {
    pub entry: Vec<String>,
    pub outdir: String,
    pub minify: bool,
    pub sourcemap: bool,
    pub watch: bool,
    pub verbose: bool,
    pub externals: Vec<String>,
    pub aliases: HashMap<String, String>,
}

impl Default for JenPackConfig {
    fn default() -> Self {
        Self {
            entry: vec!["src/index.ts".to_string()],
            outdir: "dist".to_string(),
            minify: false,
            sourcemap: true,
            watch: false,
            verbose: false,
            externals: vec![],
            aliases: Default::default(),
        }
    }
}

impl JenPackConfig {
    /// Load config from jenpack.config.toml or use defaults
    pub fn load() -> Result<Self> {
        let config_path = "jenpack.config.toml";

        if Path::new(config_path).exists() {
            let content = fs::read_to_string(config_path)?;
            let config: JenPackConfig = toml::from_str(&content)?;
            Ok(config)
        } else {
            Ok(Self::default())
        }
    }

    /// Resolve an alias if it exists
    pub fn resolve_alias(&self, name: &str) -> String {
        self.aliases
            .get(name)
            .cloned()
            .unwrap_or_else(|| name.to_string())
    }

    /// Check if a module is external
    pub fn is_external(&self, module: &str) -> bool {
        self.externals.iter().any(|e| module.starts_with(e))
    }
}
