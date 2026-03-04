use std::process::{Command, ExitStatus};
use std::env;
use std::sync::{Arc, Mutex};

/// Abstract Command Trait (Strategy Pattern)
trait CommandStrategy {
    fn node_args(&self) -> Vec<&'static str>;
}

/// Concrete Commands (Factory + Singleton)
#[derive(Debug)]
struct DevCommand;
#[derive(Debug)]
struct StartCommand;
#[derive(Debug)]
struct BuildCommand;

impl CommandStrategy for DevCommand {
    fn node_args(&self) -> Vec<&'static str> { vec!["server.js", "dev"] }
}
impl CommandStrategy for StartCommand {
    fn node_args(&self) -> Vec<&'static str> { vec!["server.js"] }
}
impl CommandStrategy for BuildCommand {
    fn node_args(&self) -> Vec<&'static str> { vec!["build.js"] }
}

/// Command Factory (Abstract Factory Pattern)
struct CommandFactory;

impl CommandFactory {
    fn create_command(cmd: &str) -> Result<Arc<dyn CommandStrategy + Send + Sync>, String> {
        match cmd {
            "dev" => Ok(Arc::new(DevCommand)),
            "start" => Ok(Arc::new(StartCommand)),
            "build" => Ok(Arc::new(BuildCommand)),
            _ => Err(format!("Unknown argument: {}", cmd)),
        }
    }
}

/// Decorator Pattern: Adds logging around command execution
struct LoggingDecorator {
    command: Arc<dyn CommandStrategy + Send + Sync>,
}

impl LoggingDecorator {
    fn new(command: Arc<dyn CommandStrategy + Send + Sync>) -> Self {
        LoggingDecorator { command }
    }

    fn execute(&self) -> Result<ExitStatus, String> {
        println!("Executing Node.js command with args: {:?}", self.command.node_args());
        run_node(&self.command)
    }
}

/// Adapter Pattern: Converts command trait into runnable function
fn run_node(cmd: &dyn CommandStrategy) -> Result<ExitStatus, String> {
    let mut child = Command::new("node")
        .args(cmd.node_args())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to start Node.js process: {}", e))?;

    let status = child.wait()
        .map_err(|e| format!("Node.js process failed: {}", e))?;

    if !status.success() {
        if let Some(code) = status.code() {
            return Err(format!("Node process exited with code: {}", code));
        } else {
            return Err("Node process terminated by signal".to_string());
        }
    }

    Ok(status)
}

/// Singleton for usage printer
struct UsagePrinter;
impl UsagePrinter {
    fn print() {
        println!("Usage:");
        println!("  jen dev     -> runs `node server.js dev`");
        println!("  jen start   -> runs `node server.js`");
        println!("  jen build   -> runs `node build.js`");
    }
}

/// Proxy Pattern: Lazy evaluation before actually creating command
struct CommandProxy {
    command_str: String,
    command: Mutex<Option<Arc<dyn CommandStrategy + Send + Sync>>>,
}

impl CommandProxy {
    fn new(command_str: &str) -> Self {
        Self {
            command_str: command_str.to_string(),
            command: Mutex::new(None),
        }
    }

    fn get(&self) -> Result<Arc<dyn CommandStrategy + Send + Sync>, String> {
        let mut lock = self.command.lock().unwrap();
        if lock.is_none() {
            *lock = Some(CommandFactory::create_command(&self.command_str)?);
        }
        Ok(lock.as_ref().unwrap().clone())
    }
}

/// Main
fn main() {
    let args: Vec<String> = env::args().collect();
    let cmd_str = args.get(1).unwrap_or_else(|| {
        eprintln!("No argument provided");
        UsagePrinter::print();
        std::process::exit(1);
    });

    let proxy = CommandProxy::new(cmd_str);
    let command = match proxy.get() {
        Ok(c) => c,
        Err(err) => {
            eprintln!("{}", err);
            UsagePrinter::print();
            std::process::exit(1);
        }
    };

    let decorated = LoggingDecorator::new(command);
    if let Err(err) = decorated.execute() {
        eprintln!("Error: {}", err);
        std::process::exit(1);
    }
}