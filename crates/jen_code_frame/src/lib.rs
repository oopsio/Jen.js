use syntect::easy::HighlightLines;
use syntect::highlighting::{Style, ThemeSet};
use syntect::parsing::SyntaxSet;
use syntect::util::{LinesWithEndings, as_24_bit_terminal_escaped};
use wasm_bindgen::prelude::*;

/// A quick check to see if frontend code is actually Rust
fn is_accidentally_rust(source: &str) -> bool {
    // Look for common Rust-only patterns that don't belong in TSX
    let rust_indicators = [
        "pub fn ",
        "fn main()",
        "use std::",
        "impl ",
        "#[wasm_bindgen",
        "#[derive",
        "let mut ",
    ];

    rust_indicators
        .iter()
        .any(|&indicator| source.contains(indicator))
}

#[wasm_bindgen(js_name = generateCodeFrame)]
pub fn generate_code_frame(
    source: &str,
    target_line: usize,
    target_column: usize,
    mut message: String,
    lines_above: usize,
    lines_below: usize,
    file_extension: &str, // Pass "tsx" or "rs" from JS
) -> String {
    // Intercept the error if it looks like Rust inside a TSX file
    if file_extension == "tsx" && is_accidentally_rust(source) {
        message = String::from(
            "Framework Error: It looks like you pasted Rust code into a .tsx file! \nKeep your Rust logic in the backend files.",
        );
    }

    // Load standard syntax and themes
    let ps = SyntaxSet::load_defaults_newlines();
    let ts = ThemeSet::load_defaults();

    // Default to TypeScript/TSX syntax, fallback to plain text
    let syntax = ps
        .find_syntax_by_extension(file_extension)
        .unwrap_or_else(|| ps.find_syntax_plain_text());

    // Use a standard dark theme for terminal output
    let mut h = HighlightLines::new(syntax, &ts.themes["base16-ocean.dark"]);

    let lines: Vec<&str> = source.lines().collect();
    let total_lines = lines.len();

    if total_lines == 0 || target_line == 0 {
        return format!("\x1b[31m{}\x1b[0m", message);
    }

    let target_idx = target_line - 1;
    let start_idx = target_idx.saturating_sub(lines_above);
    let end_idx = std::cmp::min(target_idx + lines_below, total_lines - 1);
    let max_line_num_width = (end_idx + 1).to_string().len();

    let mut frame = String::new();

    // Print the custom or original error message
    frame.push_str(&format!("\x1b[31mERROR:\x1b[0m {}\n\n", message));

    for i in start_idx..=end_idx {
        let current_line_num = i + 1;
        let is_target_line = i == target_idx;

        // syntect requires lines to have newline characters for accurate parsing
        let line_with_ending = format!("{}\n", lines[i]);

        // Apply the library's syntax highlighting
        let ranges: Vec<(Style, &str)> = h.highlight_line(&line_with_ending, &ps).unwrap();
        let colored_line = as_24_bit_terminal_escaped(&ranges[..], true);

        // Format the gutter (the gray line number)
        let gutter = format!(
            "\x1b[90m{:width$} |\x1b[0m",
            current_line_num,
            width = max_line_num_width
        );

        if is_target_line {
            frame.push_str(&format!("\x1b[31m>\x1b[0m {} {}", gutter, colored_line));

            let indent = target_column.saturating_sub(1);
            let spaces = " ".repeat(indent);
            let empty_gutter = format!(
                "  \x1b[90m{:width$} |\x1b[0m",
                " ",
                width = max_line_num_width
            );

            frame.push_str(&format!("{} {}\x1b[31m^\x1b[0m\n", empty_gutter, spaces));
        } else {
            frame.push_str(&format!("  {} {}", gutter, colored_line));
        }
    }

    frame
}
