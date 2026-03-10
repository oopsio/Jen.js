//! Integration tests for jen-launcher CLI.
//!
//! Tests the command factory, command execution, and Node.js availability checking.

use jen_launcher::{check_node_available, CommandFactory};

/// Tests that dev command is correctly created with proper Node arguments.
#[test]
fn test_dev_command_creation() {
    let cmd = CommandFactory::create_command("dev").expect("Dev command should exist");
    assert_eq!(cmd.node_args(), vec!["server.js", "dev"]);
}

/// Tests that start command is correctly created with proper Node arguments.
#[test]
fn test_start_command_creation() {
    let cmd = CommandFactory::create_command("start").expect("Start command should exist");
    assert_eq!(cmd.node_args(), vec!["server.js"]);
}

/// Tests that build command is correctly created with proper Node arguments.
#[test]
fn test_build_command_creation() {
    let cmd = CommandFactory::create_command("build").expect("Build command should exist");
    assert_eq!(cmd.node_args(), vec!["build.js"]);
}

/// Tests that analyze command is correctly created with proper Node arguments.
#[test]
fn test_analyze_command_creation() {
    let cmd = CommandFactory::create_command("analyze").expect("Analyze command should exist");
    assert_eq!(cmd.node_args(), vec!["build.js", "analyze"]);
}

/// Tests that invalid command returns an error with descriptive message.
#[test]
fn test_invalid_command_returns_error() {
    let result = CommandFactory::create_command("invalid");
    assert!(result.is_err(), "Invalid command should return an error");

    if let Err(e) = result {
        assert_eq!(e, "Unknown command: invalid");
    }
}

/// Tests that all_commands returns the correct count and command names.
#[test]
fn test_all_commands_list() {
    let commands = CommandFactory::all_commands();
    assert_eq!(commands.len(), 4, "Should have exactly 4 commands");

    // Verify command names
    let names: Vec<&str> = commands.iter().map(|(name, _)| *name).collect();
    assert_eq!(names, vec!["dev", "start", "build", "analyze"]);
}

/// Tests that all_commands includes descriptions for each command.
#[test]
fn test_all_commands_have_descriptions() {
    let commands = CommandFactory::all_commands();

    for (name, description) in commands {
        assert!(!description.is_empty(), "Command '{}' should have a description", name);
        assert!(description.len() > 5, "Description for '{}' should be meaningful", name);
    }
}

/// Tests that Node.js is available in the system PATH.
///
/// This test ensures the test environment has Node.js properly installed.
/// It will fail if Node.js is not found or not in PATH.
#[test]
fn test_node_is_available() {
    let result = check_node_available();
    assert!(
        result.is_ok(),
        "Node.js must be available in PATH. Error: {}",
        result.err().unwrap_or_default()
    );
}

/// Tests that the Node.js version string is valid when Node.js is available.
#[test]
fn test_node_version_format() {
    let result = check_node_available().expect("Node.js should be available");
    assert!(
        result.starts_with('v'),
        "Node version should start with 'v', got: {}",
        result
    );
    assert!(result.len() > 2, "Node version string should be substantial");
}

/// Tests that command creation is consistent across multiple calls.
#[test]
fn test_command_creation_consistency() {
    let cmd1 = CommandFactory::create_command("dev").unwrap();
    let cmd2 = CommandFactory::create_command("dev").unwrap();

    assert_eq!(cmd1.node_args(), cmd2.node_args());
}

/// Tests that each command name in the factory list can be created.
#[test]
fn test_all_factory_commands_are_creatable() {
    for (name, _) in CommandFactory::all_commands() {
        let result = CommandFactory::create_command(name);
        assert!(
            result.is_ok(),
            "Command '{}' should be creatable",
            name
        );
    }
}
