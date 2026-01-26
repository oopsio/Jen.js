use anyhow::{bail, Context, Result};
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

mod parser;
mod render;
mod scan;
mod value;

pub fn compile_file(entry: &Path, include_paths: &[PathBuf]) -> Result<String> {
    let mut visited = HashSet::<PathBuf>::new();
    let src = load_with_imports(entry, include_paths, &mut visited)?;
    let ast = parser::parse_scss(&src)?;
    let css = render::render_css(ast)?;
    Ok(css)
}

fn load_with_imports(
    entry: &Path,
    include_paths: &[PathBuf],
    visited: &mut HashSet<PathBuf>,
) -> Result<String> {
    let real = canonical(entry)?;
    if visited.contains(&real) {
        return Ok(String::new());
    }
    visited.insert(real.clone());

    let content = std::fs::read_to_string(&real)
        .with_context(|| format!("read: {}", real.display()))?;

    let mut out = String::new();
    let mut i = 0usize;
    let bytes = content.as_bytes();

    while i < bytes.len() {
        if starts_with_kw(bytes, i, b"@import") {
            let (stmt, next) = read_until_semicolon(&content, i)?;
            i = next;
            let path_str = parse_import_path(&stmt)?;
            let resolved = resolve_import(&path_str, real.parent().unwrap(), include_paths)?;
            let inlined = load_with_imports(&resolved, include_paths, visited)?;
            out.push_str(&inlined);
            out.push('\n');
            continue;
        }
        out.push(bytes[i] as char);
        i += 1;
    }

    Ok(out)
}

fn canonical(p: &Path) -> Result<PathBuf> {
    Ok(std::fs::canonicalize(p).with_context(|| format!("canonicalize: {}", p.display()))?)
}

fn starts_with_kw(bytes: &[u8], i: usize, kw: &[u8]) -> bool {
    if i + kw.len() > bytes.len() {
        return false;
    }
    if &bytes[i..i + kw.len()] != kw {
        return false;
    }
    let prev = if i == 0 { b' ' } else { bytes[i - 1] };
    if is_ident(prev) {
        return false;
    }
    true
}

fn is_ident(b: u8) -> bool {
    (b'A'..=b'Z').contains(&b) || (b'a'..=b'z').contains(&b) || (b'0'..=b'9').contains(&b) || b == b'_' || b == b'-'
}

fn read_until_semicolon(s: &str, start: usize) -> Result<(String, usize)> {
    let mut i = start;
    let bytes = s.as_bytes();
    while i < bytes.len() && bytes[i] != b';' {
        i += 1;
    }
    if i >= bytes.len() {
        bail!("unterminated statement near {}", start);
    }
    let stmt = s[start..=i].to_string();
    Ok((stmt, i + 1))
}

fn parse_import_path(stmt: &str) -> Result<String> {
    let mut t = stmt.trim().to_string();
    if !t.starts_with("@import") {
        bail!("not an import: {}", stmt);
    }
    t = t["@import".len()..].trim().to_string();
    if t.ends_with(';') {
        t.pop();
    }
    let t = t.trim();
    if t.starts_with('"') && t.ends_with('"') && t.len() >= 2 {
        return Ok(t[1..t.len() - 1].to_string());
    }
    if t.starts_with('\'') && t.ends_with('\'') && t.len() >= 2 {
        return Ok(t[1..t.len() - 1].to_string());
    }
    bail!("unsupported @import path: {}", stmt)
}

fn resolve_import(path_str: &str, base: &Path, include_paths: &[PathBuf]) -> Result<PathBuf> {
    let candidates = scan::import_candidates(path_str);
    for c in &candidates {
        let p = base.join(c);
        if p.exists() {
            return Ok(p);
        }
    }
    for inc in include_paths {
        for c in &candidates {
            let p = inc.join(c);
            if p.exists() {
                return Ok(p);
            }
        }
    }
    bail!("cannot resolve import: {}", path_str)
}

pub fn minify_css(css: &str) -> String {
    let mut out = String::with_capacity(css.len());
    let mut prev_space = false;
    for ch in css.chars() {
        if ch.is_whitespace() {
            if !prev_space {
                out.push(' ');
                prev_space = true;
            }
            continue;
        }
        prev_space = false;
        out.push(ch);
    }
    out.replace(" {", "{")
        .replace("{ ", "{")
        .replace("; ", ";")
        .replace(": ", ":")
        .replace(", ", ",")
        .replace(" }", "}")
        .replace("} ", "}")
}
