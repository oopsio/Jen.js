//! Jen.js Rust API
//!
//! Powerful plugin system and utilities for Rust-based Jen.js extensions.
//!
//! # Features
//!
//! - Plugin trait for extensible functionality
//! - Middleware system for request processing
//! - Route resolution and matching
//! - Configuration management
//! - Performance utilities
//!
//! # Example
//!
//! ```ignore
//! use jen_api::plugin::Plugin;
//! use jen_api::context::PluginContext;
//!
//! struct MyPlugin;
//!
//! impl Plugin for MyPlugin {
//!     fn name(&self) -> &str {
//!         "my-plugin"
//!     }
//! }
//! ```

pub mod config;
pub mod context;
pub mod error;
pub mod middleware;
pub mod plugin;
pub mod route;
pub mod utils;

pub use context::PluginContext;
pub use error::{JenError, Result};
pub use middleware::MiddlewareHandler;
pub use plugin::Plugin;

/// Jen.js version info
pub const VERSION: &str = "0.1.0";
pub const FRAMEWORK_VERSION: &str = "1.0.0";
