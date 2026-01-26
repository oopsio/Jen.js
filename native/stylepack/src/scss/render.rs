use anyhow::Result;

use super::parser::{Ast, Node};
use super::value::Vars;

#[derive(Clone, Debug)]
struct FlatRule {
    selectors: Vec<String>,
    decls: Vec<(String, String)>,
}

pub fn render_css(ast: Ast) -> Result<String> {
    let mut vars = Vars::new();
    let mut flat = Vec::<FlatRule>::new();
    flatten_nodes(&ast.nodes, &mut vars, &mut flat, &[])?;

    let mut out = String::new();
    for r in flat {
        if r.decls.is_empty() {
            continue;
        }

        if r.decls.len() == 1 && r.decls[0].0 == "@__RAW_AT__" {
            out.push_str(&r.decls[0].1);
            if !r.decls[0].1.trim_end().ends_with('\n') {
                out.push('\n');
            }
            out.push('\n');
            continue;
        }

        out.push_str(&r.selectors.join(", "));
        out.push_str(" {\n");
        for (k, v) in r.decls {
            out.push_str("  ");
            out.push_str(&k);
            out.push_str(": ");
            out.push_str(&v);
            out.push_str(";\n");
        }
        out.push_str("}\n\n");
    }
    Ok(out)
}

fn flatten_nodes(
    nodes: &[Node],
    vars: &mut Vars,
    out: &mut Vec<FlatRule>,
    parents: &[String],
) -> Result<()> {
    let mut decls = Vec::<(String, String)>::new();

    for n in nodes {
        match n {
            Node::VarDecl { name, value } => {
                vars.set(name, value);
            }
            Node::Decl { prop, value } => {
                let v = vars.resolve_value(value);
                decls.push((prop.to_string(), v));
            }
            Node::RawAt { text } => {
                out.push(FlatRule {
                    selectors: vec![],
                    decls: vec![("@__RAW_AT__".to_string(), text.to_string())],
                });
            }
            Node::Rule { selectors, body } => {
                if !decls.is_empty() {
                    let sel = if parents.is_empty() {
                        vec![":root".to_string()]
                    } else {
                        parents.to_vec()
                    };
                    out.push(FlatRule {
                        selectors: sel,
                        decls: decls.drain(..).collect(),
                    });
                }

                let merged = merge_selectors(parents, selectors);
                flatten_nodes(body, vars, out, &merged)?;
            }
        }
    }

    if !decls.is_empty() {
        let sel = if parents.is_empty() {
            vec![":root".to_string()]
        } else {
            parents.to_vec()
        };
        out.push(FlatRule {
            selectors: sel,
            decls,
        });
    }

    Ok(())
}

fn merge_selectors(parents: &[String], children: &[String]) -> Vec<String> {
    if parents.is_empty() {
        return children.to_vec();
    }
    let mut out = Vec::new();
    for p in parents {
        for c in children {
            out.push(expand_parent(p, c));
        }
    }
    out
}

fn expand_parent(parent: &str, child: &str) -> String {
    if child.contains('&') {
        child.replace("&", parent)
    } else {
        format!("{} {}", parent, child)
    }
                        }
