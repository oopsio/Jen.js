use anyhow::{bail, Result};

#[derive(Clone, Debug)]
pub enum Node {
    VarDecl { name: String, value: String },
    Rule { selectors: Vec<String>, body: Vec<Node> },
    Decl { prop: String, value: String },
    RawAt { text: String },
}

#[derive(Clone, Debug)]
pub struct Ast {
    pub nodes: Vec<Node>,
}

pub fn parse_scss(src: &str) -> Result<Ast> {
    let mut p = Parser::new(src);
    let nodes = p.parse_block_until(None)?;
    Ok(Ast { nodes })
}

struct Parser<'a> {
    s: &'a str,
    i: usize,
    n: usize,
}

impl<'a> Parser<'a> {
    fn new(s: &'a str) -> Self {
        Self { s, i: 0, n: s.len() }
    }

    fn parse_block_until(&mut self, until: Option<char>) -> Result<Vec<Node>> {
        let mut out = Vec::new();
        loop {
            self.skip_ws_and_comments();
            if self.eof() {
                break;
            }
            if let Some(u) = until {
                if self.peek_char() == Some(u) {
                    self.i += 1;
                    break;
                }
            }

            self.skip_ws_and_comments();
            if self.eof() {
                break;
            }

            if self.peek_char() == Some('$') {
                out.push(self.parse_var_decl()?);
                continue;
            }

            if self.peek_char() == Some('@') {
                out.push(self.parse_at_stmt()?);
                continue;
            }

            let head = self.read_until_any(&['{', ';'])?;
            let head_trim = head.trim().to_string();
            self.skip_ws_and_comments();

            match self.peek_char() {
                Some('{') => {
                    self.i += 1;
                    let selectors = split_selectors(&head_trim);
                    let body = self.parse_block_until(Some('}'))?;
                    out.push(Node::Rule { selectors, body });
                }
                Some(';') => {
                    self.i += 1;
                    if let Some((prop, value)) = split_decl(&head_trim) {
                        out.push(Node::Decl { prop, value });
                    } else {
                        bail!("invalid declaration: {}", head_trim);
                    }
                }
                _ => bail!("unexpected token near: {}", head_trim),
            }
        }
        Ok(out)
    }

    fn parse_var_decl(&mut self) -> Result<Node> {
        self.expect_char('$')?;
        let name = self.read_ident()?;
        self.skip_ws_and_comments();
        self.expect_char(':')?;
        let value = self.read_until_any(&[';'])?;
        self.expect_char(';')?;
        Ok(Node::VarDecl {
            name: name.trim().to_string(),
            value: value.trim().to_string(),
        })
    }

    fn parse_at_stmt(&mut self) -> Result<Node> {
        let text = self.read_until_any(&[';','{'])?;
        self.skip_ws_and_comments();
        match self.peek_char() {
            Some(';') => {
                self.i += 1;
                Ok(Node::RawAt { text: text.trim().to_string() })
            }
            Some('{') => {
                self.i += 1;
                let inner = self.parse_block_until(Some('}'))?;
                let mut rebuilt = String::new();
                rebuilt.push_str(text.trim());
                rebuilt.push_str(" {");
                rebuilt.push_str(&serialize_nodes_as_css_like(&inner));
                rebuilt.push('}');
                Ok(Node::RawAt { text: rebuilt })
            }
            _ => bail!("invalid @ rule: {}", text),
        }
    }

    fn skip_ws_and_comments(&mut self) {
        loop {
            while let Some(c) = self.peek_char() {
                if c.is_whitespace() {
                    self.i += 1;
                } else {
                    break;
                }
            }

            if self.starts_with("/*") {
                self.i += 2;
                while !self.eof() && !self.starts_with("*/") {
                    self.i += 1;
                }
                if self.starts_with("*/") {
                    self.i += 2;
                }
                continue;
            }

            if self.starts_with("//") {
                while !self.eof() {
                    let c = self.peek_char().unwrap();
                    self.i += 1;
                    if c == '\n' {
                        break;
                    }
                }
                continue;
            }

            break;
        }
    }

    fn read_until_any(&mut self, stops: &[char]) -> Result<String> {
        let start = self.i;
        let mut depth_paren = 0i32;
        let mut in_str: Option<char> = None;

        while !self.eof() {
            let c = self.peek_char().unwrap();

            if let Some(q) = in_str {
                self.i += 1;
                if c == q {
                    in_str = None;
                } else if c == '\\' && !self.eof() {
                    self.i += 1;
                }
                continue;
            }

            if c == '"' || c == '\'' {
                in_str = Some(c);
                self.i += 1;
                continue;
            }

            if c == '(' {
                depth_paren += 1;
                self.i += 1;
                continue;
            }
            if c == ')' {
                depth_paren -= 1;
                self.i += 1;
                continue;
            }

            if depth_paren == 0 && stops.contains(&c) {
                break;
            }

            self.i += 1;
        }

        Ok(self.s[start..self.i].to_string())
    }

    fn read_ident(&mut self) -> Result<String> {
        let start = self.i;
        while let Some(c) = self.peek_char() {
            let ok = c.is_ascii_alphanumeric() || c == '_' || c == '-';
            if !ok {
                break;
            }
            self.i += 1;
        }
        if self.i == start {
            bail!("expected identifier");
        }
        Ok(self.s[start..self.i].to_string())
    }

    fn expect_char(&mut self, ch: char) -> Result<()> {
        self.skip_ws_and_comments();
        if self.peek_char() == Some(ch) {
            self.i += 1;
            Ok(())
        } else {
            bail!("expected '{}'", ch)
        }
    }

    fn peek_char(&self) -> Option<char> {
        self.s[self.i..].chars().next()
    }

    fn eof(&self) -> bool {
        self.i >= self.n
    }

    fn starts_with(&self, t: &str) -> bool {
        self.s[self.i..].starts_with(t)
    }
}

fn split_decl(s: &str) -> Option<(String, String)> {
    let mut depth = 0i32;
    let mut in_str: Option<char> = None;
    for (idx, c) in s.char_indices() {
        if let Some(q) = in_str {
            if c == q {
                in_str = None;
            } else if c == '\\' {
                continue;
            }
            continue;
        }
        if c == '"' || c == '\'' {
            in_str = Some(c);
            continue;
        }
        if c == '(' {
            depth += 1;
            continue;
        }
        if c == ')' {
            depth -= 1;
            continue;
        }
        if depth == 0 && c == ':' {
            let prop = s[..idx].trim().to_string();
            let val = s[idx + 1..].trim().to_string();
            if prop.is_empty() {
                return None;
            }
            return Some((prop, val));
        }
    }
    None
}

fn split_selectors(s: &str) -> Vec<String> {
    s.split(',')
        .map(|x| x.trim().to_string())
        .filter(|x| !x.is_empty())
        .collect()
}

fn serialize_nodes_as_css_like(nodes: &[Node]) -> String {
    let mut out = String::new();
    for n in nodes {
        match n {
            Node::VarDecl { .. } => {}
            Node::Decl { prop, value } => {
                out.push_str(prop);
                out.push(':');
                out.push_str(value);
                out.push(';');
            }
            Node::Rule { selectors, body } => {
                out.push_str(&selectors.join(","));
                out.push('{');
                out.push_str(&serialize_nodes_as_css_like(body));
                out.push('}');
            }
            Node::RawAt { text } => {
                out.push_str(text);
                if !text.trim_end().ends_with(';') && !text.trim_end().ends_with('}') {
                    out.push(';');
                }
            }
        }
    }
    out
          }
