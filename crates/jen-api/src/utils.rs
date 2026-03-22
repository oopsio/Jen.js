//! Utility functions for common operations

use crate::error::Result;
use serde_json::Value;
use std::collections::HashMap;

/// Parse query string into map
pub fn parse_query_string(query: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();

    for pair in query.split('&') {
        if let Some((key, value)) = pair.split_once('=') {
            let key = urlencoding::decode(key).unwrap_or_default().to_string();
            let value = urlencoding::decode(value).unwrap_or_default().to_string();
            map.insert(key, value);
        }
    }

    map
}

/// Build query string from map
pub fn build_query_string(params: &HashMap<String, String>) -> String {
    params
        .iter()
        .map(|(k, v)| {
            format!(
                "{}={}",
                urlencoding::encode(k),
                urlencoding::encode(v)
            )
        })
        .collect::<Vec<_>>()
        .join("&")
}

/// Normalize URL path
pub fn normalize_path(path: &str) -> String {
    let mut normalized = path.to_string();

    // Remove trailing slash except for root
    if normalized != "/" && normalized.ends_with('/') {
        normalized.pop();
    }

    // Ensure leading slash
    if !normalized.starts_with('/') {
        normalized = format!("/{}", normalized);
    }

    normalized
}

/// Check if path matches pattern (with wildcard support)
pub fn path_matches(pattern: &str, path: &str) -> bool {
    if pattern == "*" {
        return true;
    }

    if pattern == path {
        return true;
    }

    if let Some(prefix) = pattern.strip_suffix("*") {
        return path.starts_with(prefix);
    }

    false
}

/// Merge JSON objects
pub fn merge_json(base: &mut Value, other: &Value) -> Result<()> {
    if !base.is_object() || !other.is_object() {
        return Ok(());
    }

    if let (Some(base_obj), Some(other_obj)) = (base.as_object_mut(), other.as_object()) {
        for (key, value) in other_obj {
            base_obj.insert(key.clone(), value.clone());
        }
    }

    Ok(())
}

/// Format bytes in human readable form
pub fn format_bytes(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;

    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }

    format!("{:.2} {}", size, UNITS[unit_index])
}

/// Format duration in human readable form
pub fn format_duration(ms: u64) -> String {
    if ms < 1000 {
        format!("{}ms", ms)
    } else if ms < 60000 {
        format!("{:.2}s", ms as f64 / 1000.0)
    } else {
        format!("{:.2}m", ms as f64 / 60000.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_query_string() {
        let query = "foo=bar&baz=qux";
        let params = parse_query_string(query);
        assert_eq!(params.get("foo").map(|s| s.as_str()), Some("bar"));
        assert_eq!(params.get("baz").map(|s| s.as_str()), Some("qux"));
    }

    #[test]
    fn test_normalize_path() {
        assert_eq!(normalize_path("foo"), "/foo");
        assert_eq!(normalize_path("/foo/"), "/foo");
        assert_eq!(normalize_path("/"), "/");
    }

    #[test]
    fn test_path_matches() {
        assert!(path_matches("*", "/any/path"));
        assert!(path_matches("/api/*", "/api/users"));
        assert!(path_matches("/exact", "/exact"));
    }

    #[test]
    fn test_format_bytes() {
        assert!(format_bytes(1024).contains("KB"));
        assert!(format_bytes(1024 * 1024).contains("MB"));
    }
}


