//! Middleware system for request processing

use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// HTTP method
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Head,
    Options,
}

impl HttpMethod {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Get => "GET",
            Self::Post => "POST",
            Self::Put => "PUT",
            Self::Delete => "DELETE",
            Self::Patch => "PATCH",
            Self::Head => "HEAD",
            Self::Options => "OPTIONS",
        }
    }
}

/// Middleware request context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiddlewareContext {
    pub method: String,
    pub url: String,
    pub pathname: String,
    pub headers: HashMap<String, String>,
    pub query_params: HashMap<String, String>,
    pub body: Option<Vec<u8>>,
    pub ip: Option<String>,
    pub user_agent: Option<String>,
    pub custom_data: HashMap<String, serde_json::Value>,
}

impl MiddlewareContext {
    /// Create new context
    pub fn new(method: String, url: String, pathname: String) -> Self {
        Self {
            method,
            url,
            pathname,
            headers: HashMap::new(),
            query_params: HashMap::new(),
            body: None,
            ip: None,
            user_agent: None,
            custom_data: HashMap::new(),
        }
    }

    /// Get header value
    pub fn get_header(&self, key: &str) -> Option<&String> {
        self.headers.get(&key.to_lowercase())
    }

    /// Get content type
    pub fn content_type(&self) -> Option<&str> {
        self.get_header("content-type").map(|s| s.as_str())
    }

    /// Get content length
    pub fn content_length(&self) -> Option<usize> {
        self.get_header("content-length")
            .and_then(|s| s.parse().ok())
    }

    /// Store custom data
    pub fn set_data(&mut self, key: String, value: serde_json::Value) {
        self.custom_data.insert(key, value);
    }

    /// Retrieve custom data
    pub fn get_data(&self, key: &str) -> Option<&serde_json::Value> {
        self.custom_data.get(key)
    }
}

/// Middleware response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiddlewareResponse {
    pub status_code: u16,
    pub headers: HashMap<String, String>,
    pub body: Option<Vec<u8>>,
    pub custom_data: HashMap<String, serde_json::Value>,
}

impl MiddlewareResponse {
    /// Create new response
    pub fn new(status_code: u16) -> Self {
        Self {
            status_code,
            headers: HashMap::new(),
            body: None,
            custom_data: HashMap::new(),
        }
    }

    /// Create OK response
    pub fn ok(body: Vec<u8>) -> Self {
        let mut resp = Self::new(200);
        resp.body = Some(body);
        resp
    }

    /// Create error response
    pub fn error(status_code: u16, message: impl Into<String>) -> Self {
        let msg = message.into();
        let mut resp = Self::new(status_code);
        resp.body = Some(msg.into_bytes());
        resp
    }

    /// Set header
    pub fn set_header(&mut self, key: String, value: String) {
        self.headers.insert(key, value);
    }

    /// Set content type
    pub fn set_content_type(&mut self, content_type: &str) {
        self.set_header("content-type".to_string(), content_type.to_string());
    }
}

/// Middleware handler type
pub type MiddlewareHandler = Box<
    dyn Fn(&MiddlewareContext) -> Result<Option<MiddlewareResponse>> + Send + Sync,
>;

/// Middleware definition
#[derive(Debug, Clone)]
pub struct MiddlewareConfig {
    pub name: String,
    pub priority: u32,
    pub enabled: bool,
    pub options: HashMap<String, serde_json::Value>,
}

impl MiddlewareConfig {
    pub fn new(name: String, priority: u32) -> Self {
        Self {
            name,
            priority,
            enabled: true,
            options: HashMap::new(),
        }
    }

    /// Set option
    pub fn set_option(&mut self, key: String, value: serde_json::Value) {
        self.options.insert(key, value);
    }

    /// Get option
    pub fn get_option(&self, key: &str) -> Option<&serde_json::Value> {
        self.options.get(key)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_middleware_context() {
        let ctx = MiddlewareContext::new("GET".to_string(), "http://localhost/api".to_string(), "/api".to_string());
        assert_eq!(ctx.method, "GET");
        assert_eq!(ctx.pathname, "/api");
    }

    #[test]
    fn test_middleware_response() {
        let resp = MiddlewareResponse::ok(b"OK".to_vec());
        assert_eq!(resp.status_code, 200);
    }
}
