# This file is part of Jen.js.
# Copyright (C) 2026 oopsio
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

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
