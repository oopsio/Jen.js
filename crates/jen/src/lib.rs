use std::collections::HashMap;
use wasm_bindgen::prelude::*;

/// Route match result with parameters and file paths
#[wasm_bindgen]
pub struct RouteMatch {
    found: bool,
    pathname: String,
    params: String, // JSON string of params
    file_path_tsx: String,
    file_path_jsx: String,
}

#[wasm_bindgen]
impl RouteMatch {
    #[wasm_bindgen(constructor)]
    pub fn new(
        found: bool,
        pathname: String,
        params: String,
        file_path_tsx: String,
        file_path_jsx: String,
    ) -> RouteMatch {
        RouteMatch {
            found,
            pathname,
            params,
            file_path_tsx,
            file_path_jsx,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn found(&self) -> bool {
        self.found
    }

    #[wasm_bindgen(getter)]
    pub fn pathname(&self) -> String {
        self.pathname.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn params(&self) -> String {
        self.params.clone()
    }

    #[wasm_bindgen(getter, js_name = filePathTsx)]
    pub fn file_path_tsx(&self) -> String {
        self.file_path_tsx.clone()
    }

    #[wasm_bindgen(getter, js_name = filePathJsx)]
    pub fn file_path_jsx(&self) -> String {
        self.file_path_jsx.clone()
    }
}

#[derive(Clone, Debug)]
struct RouteData {
    file_path_tsx: String,
    file_path_jsx: String,
}

/// High-performance route matcher for dynamic and static routes
#[wasm_bindgen]
pub struct RouteMatcher {
    // Store static routes for O(1) lookup
    static_routes: HashMap<String, RouteData>,
    // Store dynamic route patterns for pattern matching
    dynamic_routes: Vec<(String, RouteData)>,
}

#[wasm_bindgen]
impl RouteMatcher {
    /// Create a new route matcher
    #[wasm_bindgen(constructor)]
    pub fn new() -> RouteMatcher {
        RouteMatcher {
            static_routes: HashMap::new(),
            dynamic_routes: Vec::new(),
        }
    }

    /// Register a route pattern
    pub fn register(&mut self, path: String, file_path_tsx: String, file_path_jsx: String) {
        let clean_path = if path == "/" {
            "/".to_string()
        } else {
            path.trim_end_matches('/').to_string()
        };

        let route_data = RouteData {
            file_path_tsx,
            file_path_jsx,
        };

        // Check if this is a dynamic route (contains ':')
        if clean_path.contains(':') {
            self.dynamic_routes.push((clean_path, route_data));
        } else {
            self.static_routes.insert(clean_path, route_data);
        }
    }

    /// Match a pathname against registered routes
    pub fn match_route(&self, pathname: &str) -> RouteMatch {
        let clean_pathname = if pathname == "/" {
            "/".to_string()
        } else {
            pathname.trim_end_matches('/').to_string()
        };

        // First try exact static match (O(1))
        if let Some(route_data) = self.static_routes.get(&clean_pathname) {
            return RouteMatch {
                found: true,
                pathname: clean_pathname,
                params: "{}".to_string(),
                file_path_tsx: route_data.file_path_tsx.clone(),
                file_path_jsx: route_data.file_path_jsx.clone(),
            };
        }

        // Then try dynamic routes
        let incoming_segments: Vec<&str> = clean_pathname
            .split('/')
            .filter(|s| !s.is_empty())
            .collect();

        for (pattern, route_data) in &self.dynamic_routes {
            let pattern_segments: Vec<&str> =
                pattern.split('/').filter(|s| !s.is_empty()).collect();

            // Skip if segment counts don't match
            if pattern_segments.len() != incoming_segments.len() {
                continue;
            }

            let mut params = HashMap::new();
            let mut is_match = true;

            // Match each segment
            for i in 0..pattern_segments.len() {
                if pattern_segments[i].starts_with(':') {
                    // Dynamic segment - capture parameter
                    let param_name = &pattern_segments[i][1..];
                    params.insert(param_name.to_string(), incoming_segments[i].to_string());
                } else if pattern_segments[i] != incoming_segments[i] {
                    // Static segment mismatch
                    is_match = false;
                    break;
                }
            }

            if is_match {
                // Convert params to JSON string manually
                let params_json = if params.is_empty() {
                    "{}".to_string()
                } else {
                    let mut json = String::from("{");
                    let mut first = true;
                    for (k, v) in params.iter() {
                        if !first {
                            json.push(',');
                        }
                        json.push('"');
                        json.push_str(k);
                        json.push_str("\":\"");
                        json.push_str(v);
                        json.push('"');
                        first = false;
                    }
                    json.push('}');
                    json
                };

                return RouteMatch {
                    found: true,
                    pathname: clean_pathname,
                    params: params_json,
                    file_path_tsx: route_data.file_path_tsx.clone(),
                    file_path_jsx: route_data.file_path_jsx.clone(),
                };
            }
        }

        // No match found
        RouteMatch {
            found: false,
            pathname: clean_pathname,
            params: "{}".to_string(),
            file_path_tsx: String::new(),
            file_path_jsx: String::new(),
        }
    }

    /// Clear all routes
    pub fn clear(&mut self) {
        self.static_routes.clear();
        self.dynamic_routes.clear();
    }

    /// Get count of registered routes
    pub fn route_count(&self) -> usize {
        self.static_routes.len() + self.dynamic_routes.len()
    }
}

impl Default for RouteMatcher {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_static_route_matching() {
        let mut matcher = RouteMatcher::new();
        matcher.register(
            "/".to_string(),
            "/pages/index.tsx".to_string(),
            "".to_string(),
        );
        matcher.register(
            "/about".to_string(),
            "/pages/about.tsx".to_string(),
            "".to_string(),
        );

        let result = matcher.match_route("/");
        assert!(result.found);
        assert_eq!(result.pathname, "/");

        let result = matcher.match_route("/about");
        assert!(result.found);
        assert_eq!(result.pathname, "/about");

        let result = matcher.match_route("/nonexistent");
        assert!(!result.found);
    }

    #[test]
    fn test_dynamic_route_matching() {
        let mut matcher = RouteMatcher::new();
        matcher.register(
            "/blog/:slug".to_string(),
            "/pages/blog/[slug].tsx".to_string(),
            "".to_string(),
        );

        let result = matcher.match_route("/blog/hello-world");
        assert!(result.found);
        assert_eq!(result.pathname, "/blog/hello-world");
        assert!(result.params.contains("hello-world"));
    }

    #[test]
    fn test_trailing_slash_normalization() {
        let mut matcher = RouteMatcher::new();
        matcher.register(
            "/about".to_string(),
            "/pages/about.tsx".to_string(),
            "".to_string(),
        );

        let result = matcher.match_route("/about/");
        assert!(result.found);
        assert_eq!(result.pathname, "/about");
    }

    #[test]
    fn test_nested_dynamic_routes() {
        let mut matcher = RouteMatcher::new();
        matcher.register(
            "/blog/:author/:slug".to_string(),
            "/pages/blog/[author]/[slug].tsx".to_string(),
            "".to_string(),
        );

        let result = matcher.match_route("/blog/john/my-post");
        assert!(result.found);
        assert!(result.params.contains("john"));
        assert!(result.params.contains("my-post"));
    }
}
