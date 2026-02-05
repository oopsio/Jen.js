mod bundler;
mod cli;
mod config;
mod html;
mod minifier;
mod sass;
mod transform;
mod utils;
mod watcher;

use anyhow::Result;
use cli::{Cli, Command};
use config::JenPackConfig;

#[tokio::main]
async fn main() -> Result<()> {
    utils::logger::init();

    let cli = Cli::parse();

    match cli.command {
        Command::Build { entry, outdir, minify, sourcemap } => {
            let config = JenPackConfig {
                entry: entry.unwrap_or_else(|| vec!["src/index.ts".to_string()]),
                outdir: outdir.unwrap_or_else(|| "dist".to_string()),
                minify,
                sourcemap,
                watch: false,
                verbose: cli.verbose,
                externals: vec![],
                aliases: Default::default(),
            };

            if config.verbose {
                log::info!("Build config: {:?}", config);
            }

            jenpack::build(config).await?;
        }
        Command::Watch { entry, outdir, minify, sourcemap } => {
            let config = JenPackConfig {
                entry: entry.unwrap_or_else(|| vec!["src/index.ts".to_string()]),
                outdir: outdir.unwrap_or_else(|| "dist".to_string()),
                minify,
                sourcemap,
                watch: true,
                verbose: cli.verbose,
                externals: vec![],
                aliases: Default::default(),
            };

            if config.verbose {
                log::info!("Watch config: {:?}", config);
            }

            jenpack::watch(config).await?;
        }
    }

    Ok(())
}
