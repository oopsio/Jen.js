//! Route configuration and matching

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Route configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteConfig {
    /// Route path (e.g., "/blog/:slug")
    pub path: String,

    /// File path to TSX/JSX component
    pub file_path: String,

    /// Whether route is dynamic (has parameters)
    pub is_dynamic: bool,

    /// Dynamic parameter names
    pub params: Vec<String>,

    /// Route metadata
    pub metadata: HashMap<String, serde_json::Value>,

    /// Cache settings
    pub cache: CacheConfig,

    /// Route handlers
    pub handlers: Vec<String>,
}

impl RouteConfig {
    /// Create new route config
    pub fn new(path: String, file_path: String) -> Self {
        let is_dynamic = path.contains(':') || path.contains('[');
        let params = Self::extract_params(&path);

        Self {
            path,
            file_path,
            is_dynamic,
            params,
            metadata: HashMap::new(),
            cache: CacheConfig::default(),
            handlers: Vec::new(),
        }
    }

    /// Extract parameter names from path
    fn extract_params(path: &str) -> Vec<String> {
        path.split('/')
            .filter_map(|segment| {
                if let Some(stripped) = segment.strip_prefix(':') {
                    Some(stripped.to_string())
                } else if let Some(stripped) = segment.strip_prefix('[') {
                    stripped.strip_suffix(']').map(|param| param.to_string())
                } else {
                    None
                }
            })
            .collect()
    }

    /// Check if route matches path
    pub fn matches(&self, path: &str) -> bool {
        if !self.is_dynamic {
            return self.path == path;
        }

        let route_parts: Vec<&str> = self.path.split('/').collect();
        let path_parts: Vec<&str> = path.split('/').collect();

        if route_parts.len() != path_parts.len() {
            return false;
        }

        for (route_part, path_part) in route_parts.iter().zip(path_parts.iter()) {
            if route_part.starts_with(':') || route_part.starts_with('[') {
                continue;
            }
            if route_part != path_part {
                return false;
            }
        }

        true
    }

    /// Extract params from path
    pub fn extract_path_params(&self, path: &str) -> Result<HashMap<String, String>> {
        let mut params = HashMap::new();

        if !self.is_dynamic {
            return Ok(params);
        }

        let route_parts: Vec<&str> = self.path.split('/').collect();
        let path_parts: Vec<&str> = path.split('/').collect();

        if route_parts.len() != path_parts.len() {
            return Ok(params);
        }

        for (route_part, path_part) in route_parts.iter().zip(path_parts.iter()) {
            if let Some(param_name) = route_part.strip_prefix(':') {
                params.insert(param_name.to_string(), path_part.to_string());
            } else if let Some(stripped) = route_part.strip_prefix('[') {
                if let Some(param_name) = stripped.strip_suffix(']') {
                    params.insert(param_name.to_string(), path_part.to_string());
                }
            }
        }

        Ok(params)
    }

    /// Set metadata
    pub fn set_metadata(&mut self, key: String, value: serde_json::Value) {
        self.metadata.insert(key, value);
    }

    /// Get metadata
    pub fn get_metadata(&self, key: &str) -> Option<&serde_json::Value> {
        self.metadata.get(key)
    }
}

/// Cache configuration for routes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    pub enabled: bool,
    pub ttl: Option<u64>,
    pub strategy: CacheStrategy,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            ttl: None,
            strategy: CacheStrategy::Stale,
        }
    }
}

/// Cache strategy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CacheStrategy {
    /// Serve fresh or cached (SWR)
    Fresh,
    /// Serve stale while revalidating
    Stale,
    /// Always serve from cache
    CacheOnly,
    /// No caching
    NoCache,
}

/// Route matching result
#[derive(Debug, Clone)]
pub struct RouteMatch {
    pub route: RouteConfig,
    pub params: HashMap<String, String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_params() {
        let params = RouteConfig::extract_params("/blog/:slug");
        assert_eq!(params, vec!["slug"]);
    }

    #[test]
    fn test_matches() {
        let route = RouteConfig::new("/blog/:slug".to_string(), "blog.tsx".to_string());
        assert!(route.matches("/blog/hello"));
        assert!(!route.matches("/blog/hello/world"));
    }

    #[test]
    fn test_extract_path_params() {
        let route = RouteConfig::new("/blog/:slug".to_string(), "blog.tsx".to_string());
        let params = route.extract_path_params("/blog/my-post").unwrap();
        assert_eq!(params.get("slug").map(|s| s.as_str()), Some("my-post"));
    }
}
