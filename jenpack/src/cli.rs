use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "jenpack")]
#[command(about = "Fast Rust-based bundler and minifier for Jen.js")]
#[command(version)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Command,

    #[arg(short, long)]
    pub verbose: bool,
}

#[derive(Subcommand)]
pub enum Command {
    /// Build project
    Build {
        /// Entry file(s) (comma-separated)
        #[arg(short, long)]
        entry: Option<Vec<String>>,

        /// Output directory
        #[arg(short, long)]
        outdir: Option<String>,

        /// Enable minification
        #[arg(long)]
        minify: bool,

        /// Generate source maps
        #[arg(long)]
        sourcemap: bool,
    },

    /// Watch mode with rebuild on changes
    Watch {
        /// Entry file(s) (comma-separated)
        #[arg(short, long)]
        entry: Option<Vec<String>>,

        /// Output directory
        #[arg(short, long)]
        outdir: Option<String>,

        /// Enable minification
        #[arg(long)]
        minify: bool,

        /// Generate source maps
        #[arg(long)]
        sourcemap: bool,
    },
}

impl Cli {
    pub fn parse() -> Self {
        <Self as Parser>::parse()
    }
}
