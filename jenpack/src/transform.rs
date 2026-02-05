use anyhow::Result;
use regex::Regex;

#[derive(Debug, Clone)]
pub struct TransformConfig {
    pub target: String, // "es2015", "es2020", "es2022", etc.
    pub jsx: bool,
    pub sourcemap: bool,
}

impl Default for TransformConfig {
    fn default() -> Self {
        Self {
            target: "es2022".to_string(),
            jsx: true,
            sourcemap: true,
        }
    }
}

pub struct Transformer {
    config: TransformConfig,
}

impl Transformer {
    pub fn new(config: TransformConfig) -> Result<Self> {
        Ok(Self { config })
    }

    /// Transform JavaScript/TypeScript code
    pub fn transform(&self, code: &str, filename: &str) -> Result<String> {
        let is_tsx = filename.ends_with(".tsx");
        let is_ts = filename.ends_with(".ts") || is_tsx;
        let is_jsx = filename.ends_with(".jsx");

        log::debug!("Transforming {} (jsx: {}, ts: {})", filename, is_jsx, is_ts);

        // Strip types if TypeScript
        let mut result = code.to_string();
        if is_ts {
            result = Self::strip_types(&result)?;
        }

        Ok(result)
    }

    /// Strip TypeScript types from code
    pub fn strip_types(code: &str) -> Result<String> {
        // Basic type stripping
        let mut result = code.to_string();

        // Remove type annotations: : Type
        result = regex::Regex::new(r":\s*[A-Za-z_<>[\],\s]*(?=[,\)\=;])")?
            .replace_all(&result, "")
            .to_string();

        // Remove type imports
        result = regex::Regex::new(r"import\s+type\s+.*?from\s+['\"].*?['\"];?")?
            .replace_all(&result, "")
            .to_string();

        // Remove interface declarations
        result = regex::Regex::new(r"interface\s+[A-Za-z_][A-Za-z0-9_]*\s*\{[^}]*\}")?
            .replace_all(&result, "")
            .to_string();

        // Remove type aliases
        result = regex::Regex::new(r"type\s+[A-Za-z_][A-Za-z0-9_]*\s*=\s*[^;]+;")?
            .replace_all(&result, "")
            .to_string();

        Ok(result)
    }

    /// Convert CommonJS to ESM (basic)
    pub fn to_esm(code: &str) -> Result<String> {
        let mut result = code.to_string();

        // require() → import
        result = regex::Regex::new(r"const\s+(\{?[^}]*\}?)\s*=\s*require\(['\"](.*?)['\"]\);")?
            .replace_all(&result, "import $1 from '$2';")
            .to_string();

        // module.exports → export
        result = regex::Regex::new(r"module\.exports\s*=\s*")?
            .replace_all(&result, "export default ")
            .to_string();

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strip_types() {
        let code = "function add(a: number, b: number): number { return a + b; }";
        let result = Transformer::strip_types(code).unwrap();
        assert!(!result.contains(": number"));
    }
}
