use crate::config::JenPackConfig;
use crate::html::HtmlProcessor;
use crate::minifier::Minifier;
use crate::sass::SassCompiler;
use crate::transform::Transformer;
use crate::utils;
use anyhow::{anyhow, Result};
use dashmap::DashMap;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use walkdir::WalkDir;

pub struct Bundler {
    config: JenPackConfig,
    modules: DashMap<String, Module>,
    css_assets: DashMap<String, String>,
    entry_points: Vec<String>,
}

#[derive(Debug, Clone)]
struct Module {
    path: String,
    content: String,
    dependencies: Vec<String>,
    is_external: bool,
}

impl Bundler {
    pub fn new(config: JenPackConfig) -> Result<Self> {
        Ok(Self {
            config,
            modules: DashMap::new(),
            css_assets: DashMap::new(),
            entry_points: Vec::new(),
        })
    }

    /// Run the bundling process
    pub async fn bundle(&self) -> Result<()> {
        log::info!("📦 Bundler started with {} entry points", self.config.entry.len());

        // Create output directory
        std::fs::create_dir_all(&self.config.outdir)?;

        // Process each entry point
        for entry in &self.config.entry {
            self.process_entry(entry).await?;
        }

        // Write bundled output
        self.write_output().await?;

        log::info!("✅ Bundling complete: {}", self.config.outdir);

        Ok(())
    }

    /// Process a single entry point
    async fn process_entry(&self, entry: &str) -> Result<()> {
        log::debug!("Processing entry: {}", entry);

        let resolved_path = self.resolve_module(entry)?;

        if !Path::new(&resolved_path).exists() {
            return Err(anyhow!("Entry file not found: {}", entry));
        }

        self.collect_dependencies(&resolved_path, &mut HashSet::new())?;

        Ok(())
    }

    /// Collect all dependencies recursively
    fn collect_dependencies(&self, path: &str, visited: &mut HashSet<String>) -> Result<()> {
        if visited.contains(path) {
            return Ok(());
        }
        visited.insert(path.to_string());

        let normalized_path = utils::normalize_path(path);
        let content = utils::read_file(path)?;

        let mut dependencies = Vec::new();

        // Extract import statements
        if utils::is_js_ts_file(path) {
            dependencies = self.extract_imports(&content)?;

            // Transform code if needed
            let transformed = if utils::is_ts_file(path) {
                Transformer::strip_types(&content)?
            } else {
                content.clone()
            };

            self.modules.insert(
                normalized_path.clone(),
                Module {
                    path: normalized_path.clone(),
                    content: transformed,
                    dependencies: dependencies.clone(),
                    is_external: self.config.is_external(&normalized_path),
                },
            );
        } else if utils::is_html_file(path) {
            let assets = HtmlProcessor::extract_assets(&content)?;

            self.modules.insert(
                normalized_path.clone(),
                Module {
                    path: normalized_path.clone(),
                    content: assets.html,
                    dependencies: vec![],
                    is_external: false,
                },
            );

            // Process extracted styles
            for style in assets.styles {
                let css_name = format!(
                    "{}.css",
                    normalized_path.trim_end_matches(".html")
                );
                self.css_assets.insert(css_name, style);
            }
        } else if utils::is_sass_file(path) {
            match SassCompiler::compile(path) {
                Ok(css) => {
                    let css_name = normalized_path.replace(".scss", ".css").replace(".sass", ".css");
                    self.css_assets.insert(css_name, css);
                }
                Err(e) => {
                    log::warn!("Failed to compile SASS {}: {}", path, e);
                }
            }
        } else if utils::is_css_file(path) {
            self.css_assets.insert(normalized_path.clone(), content);
        }

        // Process dependencies
        for dep in dependencies {
            let resolved = self.resolve_module(&dep)?;
            if !self.config.is_external(&dep) {
                let _ = self.collect_dependencies(&resolved, visited);
            }
        }

        Ok(())
    }

    /// Extract import/require statements
    fn extract_imports(&self, code: &str) -> Result<Vec<String>> {
        let mut imports = Vec::new();

        // ES6 imports: import ... from '...'
        let import_re = regex::Regex::new(r#"import\s+(?:\{[^}]*\}|[\w*]+)\s+from\s+['"](.*?)['"]"#)?;
        for cap in import_re.captures_iter(code) {
            if let Some(module) = cap.get(1) {
                imports.push(module.as_str().to_string());
            }
        }

        // CommonJS requires: const ... = require('...')
        let require_re = regex::Regex::new(r#"require\s*\(\s*['"](.*?)['"]\s*\)"#)?;
        for cap in require_re.captures_iter(code) {
            if let Some(module) = cap.get(1) {
                imports.push(module.as_str().to_string());
            }
        }

        Ok(imports)
    }

    /// Resolve module path (with extensions and aliases)
    fn resolve_module(&self, module: &str) -> Result<String> {
        // Check aliases first
        let resolved = self.config.resolve_alias(module);

        // Try with extensions
        for ext in &["", ".ts", ".tsx", ".js", ".jsx", ".json"] {
            let path = format!("{}{}", resolved, ext);
            if Path::new(&path).exists() {
                return Ok(path);
            }
        }

        // Try as directory with index
        for ext in &["index.ts", "index.tsx", "index.js", "index.jsx"] {
            let path = format!("{}/{}", resolved, ext);
            if Path::new(&path).exists() {
                return Ok(path);
            }
        }

        // If nothing found, return the original (might be external)
        Ok(resolved)
    }

    /// Write bundled output
    async fn write_output(&self) -> Result<()> {
        let mut bundle_js = String::new();
        let mut bundle_css = String::new();

        // Combine all JS modules
        for ref_multi in self.modules.iter() {
            let module = ref_multi.value();
            if utils::is_js_ts_file(&module.path) {
                bundle_js.push_str("\n/* ");
                bundle_js.push_str(&module.path);
                bundle_js.push_str(" */\n");
                bundle_js.push_str(&module.content);
                bundle_js.push('\n');
            }
        }

        // Combine all CSS assets
        for ref_multi in self.css_assets.iter() {
            bundle_css.push_str("\n/* ");
            bundle_css.push_str(ref_multi.key());
            bundle_css.push_str(" */\n");
            bundle_css.push_str(ref_multi.value());
            bundle_css.push('\n');
        }

        // Minify if enabled
        if self.config.minify {
            log::debug!("Minifying JavaScript...");
            bundle_js = Minifier::minify_js(&bundle_js)?;
            bundle_css = Minifier::minify_css(&bundle_css)?;
        }

        // Write JS bundle
        if !bundle_js.is_empty() {
            let out_js = format!("{}/bundle.js", self.config.outdir);
            utils::write_file(&out_js, &bundle_js)?;
            log::info!("📄 Wrote {}", out_js);
        }

        // Write CSS bundle
        if !bundle_css.is_empty() {
            let out_css = format!("{}/bundle.css", self.config.outdir);
            utils::write_file(&out_css, &bundle_css)?;
            log::info!("🎨 Wrote {}", out_css);
        }

        // Generate source maps if enabled
        if self.config.sourcemap {
            self.generate_sourcemaps()?;
        }

        log::info!("📦 Bundled {} modules", self.modules.len());

        Ok(())
    }

    /// Generate source maps
    fn generate_sourcemaps(&self) -> Result<()> {
        log::debug!("Generating source maps...");
        // In production, would generate proper source maps
        // For now, just a placeholder
        Ok(())
    }
}

fn is_ts_file(path: &str) -> bool {
    utils::is_js_ts_file(path) && (path.ends_with(".ts") || path.ends_with(".tsx"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_bundler_creation() {
        let config = JenPackConfig::default();
        let bundler = Bundler::new(config);
        assert!(bundler.is_ok());
    }
}
