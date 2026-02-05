use anyhow::Result;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

pub mod logger {
    use log::LevelFilter;

    pub fn init() {
        env_logger::builder()
            .filter_level(LevelFilter::Info)
            .format_module_path(false)
            .format_timestamp(None)
            .init();
    }
}

/// Get the extension of a file
pub fn get_extension(path: &str) -> Option<String> {
    Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|s| s.to_lowercase())
}

/// Check if file is a JavaScript/TypeScript file
pub fn is_js_ts_file(path: &str) -> bool {
    matches!(
        get_extension(path).as_deref(),
        Some("js" | "ts" | "jsx" | "tsx")
    )
}

/// Check if file is HTML
pub fn is_html_file(path: &str) -> bool {
    matches!(get_extension(path).as_deref(), Some("html" | "htm"))
}

/// Check if file is SASS/SCSS
pub fn is_sass_file(path: &str) -> bool {
    matches!(
        get_extension(path).as_deref(),
        Some("sass" | "scss")
    )
}

/// Check if file is CSS
pub fn is_css_file(path: &str) -> bool {
    matches!(get_extension(path).as_deref(), Some("css"))
}

/// Read file contents
pub fn read_file(path: &str) -> Result<String> {
    fs::read_to_string(path).map_err(|e| anyhow::anyhow!("Failed to read file {}: {}", path, e))
}

/// Write file contents
pub fn write_file(path: &str, content: &str) -> Result<()> {
    fs::create_dir_all(Path::new(path).parent().unwrap_or_else(|| Path::new(".")))?;
    fs::write(path, content)
        .map_err(|e| anyhow::anyhow!("Failed to write file {}: {}", path, e))
}

/// Find all files matching a glob pattern
pub fn glob_files(pattern: &str) -> Result<Vec<PathBuf>> {
    let mut results = Vec::new();
    for entry in glob::glob(pattern)? {
        if let Ok(path) = entry {
            results.push(path);
        }
    }
    Ok(results)
}

/// Walk directory and collect files
pub fn collect_files(dir: &str, extensions: &[&str]) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();
    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
    {
        let path = entry.path();
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if extensions.contains(&ext) {
                files.push(path.to_path_buf());
            }
        }
    }
    Ok(files)
}

/// Normalize file path (convert backslashes to forward slashes)
pub fn normalize_path(path: &str) -> String {
    path.replace("\\", "/")
}

/// Compute file hash for cache busting
pub fn compute_hash(content: &str) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    format!("{:x}", hasher.finalize())[..8].to_string()
}

/// Get relative path
pub fn relative_path(from: &str, to: &str) -> Result<String> {
    let from_path = std::path::absolute::path(from)?;
    let to_path = std::path::absolute::path(to)?;

    Ok(pathdiff::diff_paths(&to_path, &from_path)
        .unwrap_or_else(|| PathBuf::from(to))
        .to_string_lossy()
        .to_string())
}

pub use sha2;
