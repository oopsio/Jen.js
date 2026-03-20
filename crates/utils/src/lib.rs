use aho_corasick::AhoCorasick;
use regex::Regex;
use walkdir::WalkDir;
use wasm_bindgen::prelude::*;

// 1. The Warp-Speed String Replacer
#[wasm_bindgen]
pub fn fast_replace(content: String, keys: Vec<String>, values: Vec<String>) -> String {
    let ac = match AhoCorasick::new(&keys) {
        Ok(matcher) => matcher,
        Err(_) => return content,
    };
    ac.replace_all(&content, &values)
}

// 2. The Pure Rust File Hasher
#[wasm_bindgen]
pub fn fast_hash(content: &str) -> String {
    // We use md5::compute which is much simpler and works perfectly!
    let digest = md5::compute(content);
    let hex_string = format!("{:x}", digest);
    hex_string[0..10].to_string()
}

// 3. The Lightning Directory Crawler
#[wasm_bindgen]
pub fn fast_crawl(dir: &str, extensions: Vec<String>) -> Vec<String> {
    let mut files = Vec::new();

    // WalkDir automatically digs through all folders and subfolders
    for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let path = entry.path().to_string_lossy().to_string();

            // If no extensions were provided, or if the file matches the extensions we want
            if extensions.is_empty() || extensions.iter().any(|ext| path.ends_with(ext)) {
                files.push(path);
            }
        }
    }

    files
}

// 4. The HTML Heavy-Lifter
#[wasm_bindgen]
pub fn fast_clean_html(mut content: String, depth: usize) -> String {
    // A. Strip polyfills out instantly
    let polyfill_re =
        Regex::new(r#"(?i)<script\s+[^>]*src=["']?[^>]*polyfills?[^>]*["']?[^>]*></script>"#)
            .unwrap();
    content = polyfill_re.replace_all(&content, "").to_string();

    // B. Figure out our relative path prefix based on the folder depth
    let root_prefix = if depth == 0 {
        String::from("./")
    } else {
        "../".repeat(depth)
    };

    // C. Fix all href and src tags to be relative
    let path_re = Regex::new(r#"(href|src)=["']\/([^"']*)["']"#).unwrap();
    content = path_re
        .replace_all(&content, |caps: &regex::Captures| {
            format!("{}=\"{}{}\"", &caps[1], root_prefix, &caps[2])
        })
        .to_string();

    // D. Fix the runtime imports
    let runtime_re = Regex::new(r#"from\s*["']\/__runtime\/([^"']+)["']"#).unwrap();
    content = runtime_re
        .replace_all(&content, |caps: &regex::Captures| {
            format!("from \"{}{}\"", root_prefix, &caps[1])
        })
        .to_string();

    content
}
