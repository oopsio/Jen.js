pub fn import_candidates(path_str: &str) -> Vec<String> {
    let mut out = Vec::new();

    let raw = path_str.replace("\\", "/");
    let has_ext = raw.ends_with(".scss") || raw.ends_with(".sass") || raw.ends_with(".css");

    if has_ext {
        out.push(raw.clone());
        out.push(partialize(&raw));
        return out;
    }

    out.push(format!("{}.scss", raw));
    out.push(partialize(&format!("{}.scss", raw)));
    out.push(format!("{}/index.scss", raw));
    out.push(partialize(&format!("{}/index.scss", raw)));

    out
}

fn partialize(p: &str) -> String {
    if let Some(idx) = p.rfind('/') {
        let (dir, file) = p.split_at(idx + 1);
        return format!("{}_{file}", dir);
    }
    format!("_{}", p)
}
