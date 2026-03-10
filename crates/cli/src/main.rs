//! Jen CLI launcher.
//!
//! Command-line interface for executing jen.js framework commands.
//!
//! # Usage
//!
//! ```text
//! jen-launcher <COMMAND>
//!
//! Commands:
//!   dev      Run development server with HMR
//!   start    Start production server
//!   build    Build static site
//!   analyze  Analyze bundle and generate report
//!   help     Show this help message
//! ```
//!
//! # Examples
//!
//! ```sh
//! jen-launcher dev      # Start development server
//! jen-launcher build    # Build the static site
//! jen-launcher analyze  # Analyze the bundle
//! ```

use std::env;
use std::error::Error;

use jen_launcher::{CommandFactory, run_node};

/// Displays the help message with available commands and usage information.
fn print_help() {
    println!("Jen launcher - Framework command executor\n");
    println!("Usage: jen-launcher <COMMAND>\n");
    println!("Commands:");

    for (name, desc) in CommandFactory::all_commands() {
        println!("  {:<10} {}", name, desc);
    }

    println!("\nExamples:");
    println!("  jen-launcher dev      Start development server");
    println!("  jen-launcher build    Build static site");
    println!("  jen-launcher help     Show this help message");
}

/// Main entry point for the CLI.
///
/// Parses command-line arguments and executes the corresponding command,
/// or displays help if no valid command is provided.
///
/// # Returns
///
/// Returns `Ok(())` on successful command execution, or an error if setup fails
/// or the child process encounters an error.
fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();

    // Get the command (default to help if none provided)
    let cmd_str = if args.len() > 1 {
        args[1].as_str()
    } else {
        "help"
    };

    match cmd_str {
        "help" | "-h" | "--help" => {
            print_help();
            Ok(())
        }
        "dev" | "start" | "build" | "analyze" => {
            let command = CommandFactory::create_command(cmd_str)?;
            run_node(command.as_ref())?;
            Ok(())
        }
        _ => {
            eprintln!("Error: Unknown command '{}'", cmd_str);
            eprintln!("Run 'jen-launcher help' for usage information.\n");
            print_help();
            Err(format!("Unknown command: {}", cmd_str).into())
        }
    }
}
