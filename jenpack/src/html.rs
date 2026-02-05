use anyhow::Result;
use regex::Regex;

pub struct HtmlProcessor;

#[derive(Debug, Clone)]
pub struct ExtractedAssets {
    pub scripts: Vec<String>,
    pub styles: Vec<String>,
    pub html: String,
}

impl HtmlProcessor {
    /// Extract inline scripts and styles from HTML
    pub fn extract_assets(html: &str) -> Result<ExtractedAssets> {
        let mut scripts = Vec::new();
        let mut styles = Vec::new();
        let mut processed_html = html.to_string();

        // Extract inline scripts
        let script_re = Regex::new(r#"<script[^>]*>\s*([\s\S]*?)\s*</script>"#)?;
        for cap in script_re.captures_iter(html) {
            if let Some(script_content) = cap.get(1) {
                scripts.push(script_content.as_str().to_string());
            }
        }
        processed_html = script_re.replace_all(&processed_html, "").to_string();

        // Extract inline styles
        let style_re = Regex::new(r#"<style[^>]*>\s*([\s\S]*?)\s*</style>"#)?;
        for cap in style_re.captures_iter(html) {
            if let Some(style_content) = cap.get(1) {
                styles.push(style_content.as_str().to_string());
            }
        }
        processed_html = style_re.replace_all(&processed_html, "").to_string();

        // Remove script tags but keep external scripts
        let external_script_re = Regex::new(r#"<script\s+src="([^"]*)"\s*></script>"#)?;
        let mut has_external_scripts = false;
        for cap in external_script_re.captures_iter(html) {
            has_external_scripts = true;
            if let Some(src) = cap.get(1) {
                log::debug!("Found external script: {}", src.as_str());
            }
        }

        Ok(ExtractedAssets {
            scripts,
            styles,
            html: processed_html.trim().to_string(),
        })
    }

    /// Inline extracted assets back into HTML
    pub fn inline_assets(html: &str, scripts: &[String], styles: &[String]) -> Result<String> {
        let mut result = html.to_string();

        // Inject styles in head
        if !styles.is_empty() {
            let style_tag = format!(
                "<style>{}</style>",
                styles.join("\n")
            );
            if let Some(head_end) = result.find("</head>") {
                result.insert_str(head_end, &style_tag);
            } else {
                result.insert_str(0, &format!("<head>{}</head>", style_tag));
            }
        }

        // Inject scripts before closing body
        if !scripts.is_empty() {
            let script_tag = format!(
                "<script>{}</script>",
                scripts.join("\n")
            );
            if let Some(body_end) = result.find("</body>") {
                result.insert_str(body_end, &script_tag);
            } else {
                result.push_str(&format!("{}</body>", script_tag));
            }
        }

        Ok(result)
    }

    /// Copy static assets from input to output
    pub fn copy_static_assets(from_dir: &str, to_dir: &str) -> Result<Vec<String>> {
        let mut copied = Vec::new();

        for entry in walkdir::WalkDir::new(from_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
        {
            let path = entry.path();
            let relative = path.strip_prefix(from_dir)?;

            // Skip HTML and script files
            if !matches!(path.extension().and_then(|s| s.to_str()), Some("html" | "js" | "ts" | "tsx" | "jsx")) {
                let out_path = std::path::PathBuf::from(to_dir).join(relative);
                std::fs::create_dir_all(out_path.parent().unwrap_or_else(|| std::path::Path::new(".")))?;
                std::fs::copy(path, &out_path)?;
                copied.push(out_path.to_string_lossy().to_string());
            }
        }

        Ok(copied)
    }

    /// Minify HTML
    pub fn minify(html: &str) -> Result<String> {
        crate::minifier::Minifier::minify_html(html)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_scripts() {
        let html = r#"
            <html>
                <head>
                    <style>body { color: red; }</style>
                </head>
                <body>
                    <script>console.log('hello');</script>
                </body>
            </html>
        "#;
        let assets = HtmlProcessor::extract_assets(html).unwrap();
        assert_eq!(assets.scripts.len(), 1);
        assert_eq!(assets.styles.len(), 1);
        assert!(assets.html.contains("<html>"));
        assert!(!assets.html.contains("<script>"));
    }
}
