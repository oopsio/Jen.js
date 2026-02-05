pub mod bundler;
pub mod cli;
pub mod config;
pub mod html;
pub mod minifier;
pub mod sass;
pub mod transform;
pub mod utils;
pub mod watcher;

pub use bundler::Bundler;
pub use config::JenPackConfig;
pub use utils::logger;

use anyhow::Result;

pub async fn build(config: JenPackConfig) -> Result<()> {
    let start = std::time::Instant::now();
    log::info!("🚀 Starting JenPack build");

    let bundler = Bundler::new(config)?;
    bundler.bundle().await?;

    let elapsed = start.elapsed();
    log::info!(
        "✨ Build completed in {:.2}s",
        elapsed.as_secs_f64()
    );

    Ok(())
}

pub async fn watch(config: JenPackConfig) -> Result<()> {
    log::info!("👀 Starting JenPack in watch mode");
    let watcher = watcher::Watcher::new(config)?;
    watcher.watch().await?;
    Ok(())
}
