//! Error types for Jen.js Rust API

use serde_json::json;
use std::fmt;

/// Result type for Jen operations
pub type Result<T> = std::result::Result<T, JenError>;

/// Main error type for Jen.js operations
#[derive(Debug)]
pub struct JenError {
    pub kind: ErrorKind,
    pub message: String,
    pub context: Option<String>,
}

/// Error categories
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ErrorKind {
    Plugin,
    Middleware,
    Route,
    Config,
    IO,
    Serialization,
    Validation,
    Runtime,
}

impl JenError {
    /// Create a new error
    pub fn new(kind: ErrorKind, message: impl Into<String>) -> Self {
        Self {
            kind,
            message: message.into(),
            context: None,
        }
    }

    /// Add context to error
    pub fn with_context(mut self, context: impl Into<String>) -> Self {
        self.context = Some(context.into());
        self
    }

    /// Plugin error
    pub fn plugin(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Plugin, message)
    }

    /// Middleware error
    pub fn middleware(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Middleware, message)
    }

    /// Route error
    pub fn route(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Route, message)
    }

    /// Config error
    pub fn config(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Config, message)
    }

    /// IO error
    pub fn io(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::IO, message)
    }

    /// Serialization error
    pub fn serialization(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Serialization, message)
    }

    /// Validation error
    pub fn validation(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Validation, message)
    }

    /// Runtime error
    pub fn runtime(message: impl Into<String>) -> Self {
        Self::new(ErrorKind::Runtime, message)
    }

    /// Convert to JSON for logging
    pub fn to_json(&self) -> serde_json::Value {
        json!({
            "kind": format!("{:?}", self.kind),
            "message": self.message,
            "context": self.context,
        })
    }
}

impl fmt::Display for JenError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{:?}] {}", self.kind, self.message)?;
        if let Some(ctx) = &self.context {
            write!(f, " ({})", ctx)?;
        }
        Ok(())
    }
}

impl std::error::Error for JenError {}

impl From<serde_json::Error> for JenError {
    fn from(err: serde_json::Error) -> Self {
        JenError::serialization(err.to_string())
    }
}

impl From<std::io::Error> for JenError {
    fn from(err: std::io::Error) -> Self {
        JenError::io(err.to_string())
    }
}
