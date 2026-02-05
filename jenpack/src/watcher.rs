use crate::config::JenPackConfig;
use crate::Bundler;
use anyhow::Result;
use notify::{Watcher, RecursiveMode, watcher};
use std::sync::mpsc;
use std::time::Duration;

pub struct FileWatcher {
    config: JenPackConfig,
}

impl FileWatcher {
    pub fn new(config: JenPackConfig) -> Result<Self> {
        Ok(Self { config })
    }

    /// Watch for file changes and rebuild
    pub async fn watch(&self) -> Result<()> {
        let (tx, rx) = mpsc::channel();

        // Create watcher
        let mut watcher = watcher(
            move |res: notify::Result<notify::Event>| {
                if let Ok(event) = res {
                    let _ = tx.send(event);
                }
            },
            notify::Config::default().with_poll_interval(Duration::from_secs(1)),
        )?;

        // Watch source directories
        let watch_paths = vec!["src", "assets", "styles", "public"];
        
        for path in &watch_paths {
            if std::path::Path::new(path).exists() {
                log::info!("👁️ Watching: {}", path);
                watcher.watch(std::path::Path::new(path), RecursiveMode::Recursive)?;
            }
        }

        // Watch config file
        if std::path::Path::new("jenpack.config.toml").exists() {
            watcher.watch(std::path::Path::new("jenpack.config.toml"), RecursiveMode::NonRecursive)?;
        }

        // Debounce rapid changes
        let mut last_rebuild = std::time::Instant::now();
        let debounce_duration = Duration::from_millis(500);

        log::info!("⏱️ Watching for changes... (press Ctrl+C to stop)");

        while let Ok(event) = rx.recv() {
            if last_rebuild.elapsed() > debounce_duration {
                let should_rebuild = match &event.kind {
                    notify::EventKind::Access(_) => false,
                    notify::EventKind::Create(_) => true,
                    notify::EventKind::Modify(_) => true,
                    notify::EventKind::Remove(_) => true,
                    notify::EventKind::Error(_) => false,
                    _ => false,
                };

                if should_rebuild {
                    for path in &event.paths {
                        if let Some(path_str) = path.to_str() {
                            log::debug!("📝 Changed: {}", path_str);
                        }
                    }

                    let start = std::time::Instant::now();
                    match self.rebuild().await {
                        Ok(_) => {
                            log::info!(
                                "✨ Rebuild completed in {:.2}s",
                                start.elapsed().as_secs_f64()
                            );
                        }
                        Err(e) => {
                            log::error!("❌ Build failed: {}", e);
                        }
                    }

                    last_rebuild = std::time::Instant::now();
                }
            }
        }

        Ok(())
    }

    /// Rebuild project
    async fn rebuild(&self) -> Result<()> {
        let bundler = Bundler::new(self.config.clone())?;
        bundler.bundle().await?;
        Ok(())
    }
}

pub struct Watcher {
    config: JenPackConfig,
}

impl Watcher {
    pub fn new(config: JenPackConfig) -> Result<Self> {
        Ok(Self { config })
    }

    pub async fn watch(&self) -> Result<()> {
        let (tx, rx) = mpsc::channel();

        let mut watcher = watcher(
            move |res: notify::Result<notify::Event>| {
                if let Ok(event) = res {
                    let _ = tx.send(event);
                }
            },
            notify::Config::default().with_poll_interval(Duration::from_secs(1)),
        )?;

        // Watch source directories
        for path in &["src", "assets", "styles", "public"] {
            if std::path::Path::new(path).exists() {
                log::info!("👁️ Watching: {}", path);
                watcher.watch(std::path::Path::new(path), RecursiveMode::Recursive)?;
            }
        }

        // Watch entry files directly
        for entry in &self.config.entry {
            let entry_path = std::path::Path::new(entry);
            if entry_path.exists() {
                if entry_path.is_file() {
                    if let Some(parent) = entry_path.parent() {
                        watcher.watch(parent, RecursiveMode::Recursive)?;
                    }
                }
            }
        }

        // Debounce
        let mut last_rebuild = std::time::Instant::now();
        let debounce_duration = Duration::from_millis(300);

        log::info!("⏱️  Watching for changes... (press Ctrl+C to stop)");

        while let Ok(event) = rx.recv() {
            if last_rebuild.elapsed() > debounce_duration {
                match &event.kind {
                    notify::EventKind::Modify(_) | notify::EventKind::Create(_) | notify::EventKind::Remove(_) => {
                        let start = std::time::Instant::now();

                        match self.rebuild().await {
                            Ok(_) => {
                                log::info!(
                                    "✨ Rebuild in {:.2}s",
                                    start.elapsed().as_secs_f64()
                                );
                            }
                            Err(e) => {
                                log::error!("❌ Build failed: {}", e);
                            }
                        }

                        last_rebuild = std::time::Instant::now();
                    }
                    _ => {}
                }
            }
        }

        Ok(())
    }

    async fn rebuild(&self) -> Result<()> {
        let bundler = Bundler::new(self.config.clone())?;
        bundler.bundle().await?;
        Ok(())
    }
}
