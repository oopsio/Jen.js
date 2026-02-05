use anyhow::{anyhow, Result};
use std::path::Path;
use std::process::Command;

pub struct SassCompiler;

impl SassCompiler {
    /// Compile SASS/SCSS to CSS
    pub fn compile(input_path: &str) -> Result<String> {
        // Check if sass CLI is available
        if !Self::is_sass_installed()? {
            log::warn!("Sass CLI not found, installing dart-sass...");
            Self::install_sass()?;
        }

        let output = Command::new("sass")
            .arg("--no-source-map")
            .arg(input_path)
            .output()?;

        if !output.status.success() {
            return Err(anyhow!(
                "Sass compilation failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        Ok(String::from_utf8(output.stdout)?)
    }

    /// Compile SASS/SCSS to CSS with source map
    pub fn compile_with_sourcemap(input_path: &str, output_path: &str) -> Result<()> {
        if !Self::is_sass_installed()? {
            Self::install_sass()?;
        }

        let status = Command::new("sass")
            .arg(input_path)
            .arg(output_path)
            .status()?;

        if !status.success() {
            return Err(anyhow!("Sass compilation with source map failed"));
        }

        Ok(())
    }

    /// Check if Sass is installed
    fn is_sass_installed() -> Result<bool> {
        let output = Command::new("sass")
            .arg("--version")
            .output()?;

        Ok(output.status.success())
    }

    /// Install Sass using npm
    fn install_sass() -> Result<()> {
        let output = Command::new("npm")
            .args(&["install", "-g", "sass"])
            .output()?;

        if !output.status.success() {
            return Err(anyhow!(
                "Failed to install sass: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        log::info!("Sass installed successfully");
        Ok(())
    }

    /// Convert inline SASS to CSS
    pub fn compile_inline(sass_code: &str) -> Result<String> {
        use tempfile::NamedTempFile;
        use std::io::Write;

        // Create temporary SCSS file
        let mut temp_file = NamedTempFile::new()?;
        temp_file.write_all(sass_code.as_bytes())?;
        let temp_path = temp_file.path().to_string_lossy().to_string();

        // Compile to CSS
        let css = Self::compile(&temp_path)?;

        Ok(css)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sass_check() {
        // This might fail if Sass isn't installed
        let is_installed = SassCompiler::is_sass_installed();
        log::info!("Sass installed: {:?}", is_installed);
    }
}
