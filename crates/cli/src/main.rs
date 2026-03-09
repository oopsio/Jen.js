use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Alignment, Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph},
    Frame, Terminal,
};
use std::env;
use std::error::Error;
use std::io;
use std::process::{Command, ExitStatus};
use std::sync::Arc;

// ============================================================================
// COMMAND STRATEGY PATTERN (from original code)
// ============================================================================

trait CommandStrategy {
    fn node_args(&self) -> Vec<&'static str>;
}

#[derive(Debug)]
struct DevCommand;
#[derive(Debug)]
struct StartCommand;
#[derive(Debug)]
struct BuildCommand;

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

struct CommandFactory;

impl CommandFactory {
    fn create_command(cmd: &str) -> Result<Arc<dyn CommandStrategy + Send + Sync>, String> {
        match cmd {
            "dev" => Ok(Arc::new(DevCommand)),
            "start" => Ok(Arc::new(StartCommand)),
            "build" => Ok(Arc::new(BuildCommand)),
            _ => Err(format!("Unknown command: {}", cmd)),
        }
    }

    fn all_commands() -> Vec<(&'static str, &'static str)> {
        vec![
            ("dev", "Run development server"),
            ("start", "Start production server"),
            ("build", "Build static site"),
        ]
    }
}

fn run_node(cmd: &dyn CommandStrategy) -> Result<ExitStatus, String> {
    let mut child = Command::new("node")
        .args(cmd.node_args())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to start Node.js process: {}", e))?;

    let status = child
        .wait()
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

// ============================================================================
// TUI STATE & APPLICATION
// ============================================================================

#[derive(Debug, Clone, Copy)]
enum MenuItem {
    Dev,
    Start,
    Build,
}

struct App {
    selected: MenuItem,
    status_message: String,
    last_key_time: std::time::Instant,
}

impl Default for App {
    fn default() -> Self {
        App {
            selected: MenuItem::Dev,
            status_message: "Select a command • Use ↑↓ to navigate • Enter to run • Q to quit"
                .to_string(),
            last_key_time: std::time::Instant::now(),
        }
    }
}

impl App {
    fn next(&mut self) {
        self.selected = match self.selected {
            MenuItem::Dev => MenuItem::Start,
            MenuItem::Start => MenuItem::Build,
            MenuItem::Build => MenuItem::Dev,
        };
    }

    fn previous(&mut self) {
        self.selected = match self.selected {
            MenuItem::Dev => MenuItem::Build,
            MenuItem::Start => MenuItem::Dev,
            MenuItem::Build => MenuItem::Start,
        };
    }

    fn command_name(&self) -> &'static str {
        match self.selected {
            MenuItem::Dev => "dev",
            MenuItem::Start => "start",
            MenuItem::Build => "build",
        }
    }
}

// ============================================================================
// UI RENDERING
// ============================================================================

fn ui(f: &mut Frame, app: &App) {
    let size = f.size();

    // Header + Content + Footer layout
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(5),
            Constraint::Min(10),
            Constraint::Length(3),
        ])
        .split(size);

    // ===== HEADER =====
    let header_block = Block::default()
        .borders(Borders::ALL)
        .style(Style::default().fg(Color::Cyan));

    let header_text = vec![
        Line::from(vec![
            Span::styled("   ⚡ ", Style::default().fg(Color::Yellow)),
            Span::styled("jen launcher", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
            Span::styled(" ⚡", Style::default().fg(Color::Yellow)),
        ]),
        Line::from(""),
        Line::from(vec![
            Span::raw("   Node.js command executor • "),
            Span::styled("v0.1.0", Style::default().fg(Color::Green)),
        ]),
    ];

    let header = Paragraph::new(header_text)
        .block(header_block)
        .alignment(Alignment::Center);
    f.render_widget(header, chunks[0]);

    // ===== MENU =====
    let menu_block = Block::default()
        .title(" Commands ")
        .borders(Borders::ALL)
        .border_style(Style::default().fg(Color::White));

    let mut lines = vec![Line::from("")];

    for (cmd, desc) in CommandFactory::all_commands() {
        let is_selected = match app.selected {
            MenuItem::Dev => cmd == "dev",
            MenuItem::Start => cmd == "start",
            MenuItem::Build => cmd == "build",
        };

        if is_selected {
            lines.push(Line::from(vec![
                Span::styled("  ▶ ", Style::default().fg(Color::Yellow)),
                Span::styled(cmd, Style::default().fg(Color::Black).bg(Color::Cyan).add_modifier(Modifier::BOLD)),
                Span::raw(" - "),
                Span::styled(desc, Style::default().fg(Color::White)),
            ]));
        } else {
            lines.push(Line::from(vec![
                Span::raw("    "),
                Span::styled(cmd, Style::default().fg(Color::Cyan)),
                Span::raw(" - "),
                Span::raw(desc),
            ]));
        }
    }

    lines.push(Line::from(""));

    let menu = Paragraph::new(lines)
        .block(menu_block)
        .style(Style::default().fg(Color::White));
    f.render_widget(menu, chunks[1]);

    // ===== FOOTER =====
    let footer = Paragraph::new(app.status_message.clone())
        .style(Style::default().fg(Color::DarkGray))
        .alignment(Alignment::Center);
    f.render_widget(footer, chunks[2]);
}

// ============================================================================
// EVENT HANDLING & MAIN LOOP
// ============================================================================

fn run_app(terminal: &mut Terminal<CrosstermBackend<io::Stdout>>, mut app: App) -> io::Result<()> {
    const KEY_DEBOUNCE_MS: u128 = 150;

    loop {
        terminal.draw(|f| ui(f, &app))?;

        if crossterm::event::poll(std::time::Duration::from_millis(100))? {
            if let Event::Key(key) = event::read()? {
                let elapsed = app.last_key_time.elapsed().as_millis();

                match key.code {
                    KeyCode::Char('q') | KeyCode::Char('Q') => return Ok(()),
                    KeyCode::Up if elapsed > KEY_DEBOUNCE_MS => {
                        app.previous();
                        app.last_key_time = std::time::Instant::now();
                    }
                    KeyCode::Down if elapsed > KEY_DEBOUNCE_MS => {
                        app.next();
                        app.last_key_time = std::time::Instant::now();
                    }
                    KeyCode::Enter => {
                        let cmd_name = app.command_name();
                        match CommandFactory::create_command(cmd_name) {
                            Ok(cmd) => {
                                match run_node(cmd.as_ref()) {
                                    Ok(_) => app.status_message = format!("✓ '{}' completed", cmd_name),
                                    Err(e) => app.status_message = format!("✗ Error: {}", e),
                                }
                            }
                            Err(e) => app.status_message = format!("✗ Error: {}", e),
                        }
                    }
                    _ => {}
                }
            }
        }
    }
}

// ============================================================================
// TERMINAL SETUP/TEARDOWN
// ============================================================================

fn setup_terminal() -> Result<Terminal<CrosstermBackend<io::Stdout>>, Box<dyn Error>> {
    let mut stdout = io::stdout();
    enable_raw_mode()?;
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let terminal = Terminal::new(backend)?;
    Ok(terminal)
}

fn restore_terminal(
    terminal: &mut Terminal<CrosstermBackend<io::Stdout>>,
) -> Result<(), Box<dyn Error>> {
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;
    Ok(())
}

// ============================================================================
// ENTRY POINT
// ============================================================================

fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();

    // CLI mode: if args provided, run command directly
    if args.len() > 1 {
        let cmd_str = &args[1];
        let command = CommandFactory::create_command(cmd_str)?;
        run_node(command.as_ref())?;
        return Ok(());
    }

    // TUI mode: interactive menu
    let mut terminal = setup_terminal()?;
    let app = App::default();

    let res = run_app(&mut terminal, app);

    restore_terminal(&mut terminal)?;

    res?;
    Ok(())
}
