use anyhow::Result;

pub struct Minifier;

impl Minifier {
    /// Minify JavaScript/TypeScript code
    pub fn minify_js(code: &str) -> Result<String> {
        let minified = Self::minify_internal(code);
        Ok(minified)
    }

    /// Minify CSS
    pub fn minify_css(css: &str) -> Result<String> {
        let mut minified = css.to_string();

        // Remove comments /* ... */
        minified = regex::Regex::new(r"/\*.*?\*/")?
            .replace_all(&minified, "")
            .to_string();

        // Remove comments // ...
        minified = regex::Regex::new(r"//.*?$")?
            .replace_all(&minified, "")
            .to_string();

        // Remove unnecessary whitespace
        minified = regex::Regex::new(r"\s+")?.replace_all(&minified, " ").to_string();
        minified = regex::Regex::new(r"\s*([{}:;,])\s*")?
            .replace_all(&minified, "$1")
            .to_string();

        // Remove trailing semicolons in blocks
        minified = minified.replace(";}", "}");

        Ok(minified.trim().to_string())
    }

    /// Minify HTML
    pub fn minify_html(html: &str) -> Result<String> {
        let mut minified = html.to_string();

        // Remove HTML comments
        minified = regex::Regex::new(r"<!--.*?-->")?
            .replace_all(&minified, "")
            .to_string();

        // Remove unnecessary whitespace
        minified = regex::Regex::new(r">\s+<")?
            .replace_all(&minified, "><")
            .to_string();

        // Collapse whitespace
        minified = regex::Regex::new(r"\s{2,}")?
            .replace_all(&minified, " ")
            .to_string();

        Ok(minified.trim().to_string())
    }

    fn minify_internal(code: &str) -> String {
        let mut result = code.to_string();

        // Remove block comments
        while let Some(start) = result.find("/*") {
            if let Some(end) = result[start..].find("*/") {
                result.drain(start..start + end + 2);
            } else {
                break;
            }
        }

        // Remove line comments
        result = result
            .lines()
            .map(|line| {
                if let Some(pos) = line.find("//") {
                    &line[..pos]
                } else {
                    line
                }
            })
            .collect::<Vec<_>>()
            .join("\n");

        // Collapse whitespace
        result = regex::Regex::new(r"\s+")
            .unwrap()
            .replace_all(&result, " ")
            .to_string();

        // Remove spaces around operators and brackets
        result = regex::Regex::new(r"\s*([{};,=+\-*/:])\s*")
            .unwrap()
            .replace_all(&result, "$1")
            .to_string();

        // Remove space before opening paren in function calls
        result = regex::Regex::new(r"\s+\(")
            .unwrap()
            .replace_all(&result, "(")
            .to_string();

        result.trim().to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_minify_js() {
        let code = r#"
            function hello() {
                // comment
                console.log("hello");
            }
        "#;
        let result = Minifier::minify_js(code).unwrap();
        assert!(!result.contains("//"));
        assert!(result.len() < code.len());
    }

    #[test]
    fn test_minify_css() {
        let css = r#"
            /* comment */
            .class {
                color: red;
                margin: 10px;
            }
        "#;
        let result = Minifier::minify_css(css).unwrap();
        assert!(!result.contains("/*"));
        assert!(result.len() < css.len());
    }
}
