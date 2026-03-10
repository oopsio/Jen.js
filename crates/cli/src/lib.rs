//! Jen CLI launcher library.
//!
//! Provides command execution strategies and application state management for the Jen framework.
//!
//! # Examples
//!
//! ```ignore
//! use jen_cli::{CommandFactory, run_node};
//!
//! fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let command = CommandFactory::create_command("dev")?;
//!     run_node(command.as_ref())?;
//!     Ok(())
//! }
//! ```

use std::process::{Command, ExitStatus, Stdio};
use std::sync::Arc;

/// Command execution strategy trait.
///
/// Each command type implements node arguments to execute.
pub trait CommandStrategy {
    /// Returns the arguments to pass to the Node.js process.
    fn node_args(&self) -> Vec<&'static str>;
}

/// Development server command.
#[derive(Debug)]
pub struct DevCommand;

/// Production server command.
#[derive(Debug)]
pub struct StartCommand;

/// Static site build command.
#[derive(Debug)]
pub struct BuildCommand;

/// Bundle analysis command.
#[derive(Debug)]
pub struct AnalyzeCommand;

impl CommandStrategy for DevCommand {
    fn node_args(&self) -> Vec<&'static str> {
        vec!["server.js", "dev"]
    }
}

impl CommandStrategy for StartCommand {
    fn node_args(&self) -> Vec<&'static str> {
        vec!["server.js"]
    }
}

impl CommandStrategy for BuildCommand {
    fn node_args(&self) -> Vec<&'static str> {
        vec!["build.js"]
    }
}

impl CommandStrategy for AnalyzeCommand {
    fn node_args(&self) -> Vec<&'static str> {
        vec!["build.js", "analyze"]
    }
}

/// Factory for creating command instances from string identifiers.
pub struct CommandFactory;

impl CommandFactory {
    /// Creates a command strategy from a command name.
    ///
    /// Supported commands: dev, start, build, analyze.
    ///
    /// # Arguments
    ///
    /// * `cmd` - The command name as a string slice
    ///
    /// # Returns
    ///
    /// Returns a boxed command strategy on success, or an error message if the command is unknown.
    ///
    /// # Errors
    ///
    /// Returns an error if the command name is not recognized.
    pub fn create_command(cmd: &str) -> Result<Arc<dyn CommandStrategy + Send + Sync>, String> {
        match cmd {
            "dev" => Ok(Arc::new(DevCommand)),
            "start" => Ok(Arc::new(StartCommand)),
            "build" => Ok(Arc::new(BuildCommand)),
            "analyze" => Ok(Arc::new(AnalyzeCommand)),
            _ => Err(format!("Unknown command: {}", cmd)),
        }
    }

    /// Returns list of all available commands with descriptions.
    ///
    /// # Returns
    ///
    /// A vector of tuples containing command name and description.
    pub fn all_commands() -> Vec<(&'static str, &'static str)> {
        vec![
            ("dev", "Run development server"),
            ("start", "Start production server"),
            ("build", "Build static site"),
            ("analyze", "Analyze bundle and generate report"),
        ]
    }
}

/// Checks if Node.js is available in the system PATH.
///
/// Attempts to run `node --version` to verify Node.js installation and accessibility.
///
/// # Returns
///
/// Returns `Ok(version_string)` if Node.js is found, or an error message with installation instructions.
///
/// # Errors
///
/// Returns a helpful error message if:
/// - Node.js is not installed
/// - Node.js is not in the system PATH
/// - The version check fails for any reason
pub fn check_node_available() -> Result<String, String> {
    let output = Command::new("node")
        .arg("--version")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|_| {
            "Node.js is not available in your system PATH.\n\n\
            Please ensure Node.js is installed and available in your PATH.\n\
            Download from: https://nodejs.org/\n\n\
            On macOS: brew install node\n\
            On Ubuntu: sudo apt-get install nodejs\n\
            On Windows: Download from https://nodejs.org/ or use: choco install nodejs"
                .to_string()
        })?;

    if !output.status.success() {
        return Err(
            "Node.js found but version check failed. Node.js may be corrupted or misconfigured."
                .to_string(),
        );
    }

    let version = String::from_utf8_lossy(&output.stdout);
    Ok(version.trim().to_string())
}

/// Executes a Node.js command with inherited stdout/stderr.
///
/// The command's standard output and error streams are inherited from the parent process,
/// allowing real-time output to be displayed to the user.
///
/// Verifies Node.js availability before execution.
///
/// # Arguments
///
/// * `cmd` - A reference to a command strategy trait object
///
/// # Returns
///
/// Returns the exit status on success, or an error message if execution fails.
///
/// # Errors
///
/// Returns an error if:
/// - Node.js is not available in the system PATH
/// - The Node.js process cannot be spawned
/// - Waiting for the process fails
/// - The process exits with a non-zero status code or is terminated by signal
pub fn run_node(cmd: &dyn CommandStrategy) -> Result<ExitStatus, String> {
    // Check Node.js availability first
    check_node_available()?;

    let mut child = Command::new("node")
        .args(cmd.node_args())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to start Node.js process: {}", e))?;

    let status = child
        .wait()
        .map_err(|e| format!("Node.js process failed: {}", e))?;

    if !status.success() {
        if let Some(code) = status.code() {
            return Err(format!("Node process exited with code: {}", code));
        }
        return Err("Node process terminated by signal".to_string());
    }

    Ok(status)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_command_factory_dev() {
        let cmd = CommandFactory::create_command("dev").unwrap();
        assert_eq!(cmd.node_args(), vec!["server.js", "dev"]);
    }

    #[test]
    fn test_command_factory_start() {
        let cmd = CommandFactory::create_command("start").unwrap();
        assert_eq!(cmd.node_args(), vec!["server.js"]);
    }

    #[test]
    fn test_command_factory_build() {
        let cmd = CommandFactory::create_command("build").unwrap();
        assert_eq!(cmd.node_args(), vec!["build.js"]);
    }

    #[test]
    fn test_command_factory_analyze() {
        let cmd = CommandFactory::create_command("analyze").unwrap();
        assert_eq!(cmd.node_args(), vec!["build.js", "analyze"]);
    }

    #[test]
    fn test_command_factory_invalid() {
        assert!(CommandFactory::create_command("invalid").is_err());
    }

    #[test]
    fn test_all_commands() {
        let commands = CommandFactory::all_commands();
        assert_eq!(commands.len(), 4);
        assert_eq!(commands[0].0, "dev");
        assert_eq!(commands[1].0, "start");
        assert_eq!(commands[2].0, "build");
        assert_eq!(commands[3].0, "analyze");
    }

    #[test]
    fn test_check_node_available() {
        // This test verifies Node.js is available in the test environment
        let result = check_node_available();
        assert!(
            result.is_ok(),
            "Node.js must be available in PATH to run tests. {}",
            result.err().unwrap_or_default()
        );
        let version = result.unwrap();
        assert!(version.starts_with('v'), "Node version should start with 'v'");
    }
}
