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

use std::collections::HashMap;

#[derive(Clone, Debug)]
pub struct Vars {
    map: HashMap<String, String>,
}

impl Vars {
    pub fn new() -> Self {
        Self { map: HashMap::new() }
    }

    pub fn set(&mut self, k: &str, v: &str) {
        self.map.insert(k.to_string(), v.to_string());
    }

    pub fn get(&self, k: &str) -> Option<&String> {
        self.map.get(k)
    }

    pub fn resolve_value(&self, s: &str) -> String {
        let mut out = String::new();
        let mut i = 0usize;
        let bytes = s.as_bytes();
        while i < bytes.len() {
            if bytes[i] == b'$' {
                let (name, next) = read_ident(bytes, i + 1);
                if !name.is_empty() {
                    if let Some(v) = self.get(&name) {
                        out.push_str(v);
                    } else {
                        out.push('$');
                        out.push_str(&name);
                    }
                    i = next;
                    continue;
                }
            }
            out.push(bytes[i] as char);
            i += 1;
        }
        out
    }
}

fn read_ident(bytes: &[u8], mut i: usize) -> (String, usize) {
    let start = i;
    while i < bytes.len() {
        let b = bytes[i];
        let ok = (b'A'..=b'Z').contains(&b)
            || (b'a'..=b'z').contains(&b)
            || (b'0'..=b'9').contains(&b)
            || b == b'_'
            || b == b'-';
        if !ok {
            break;
        }
        i += 1;
    }
    (String::from_utf8_lossy(&bytes[start..i]).to_string(), i)
}
