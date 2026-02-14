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

use anyhow::{bail, Context, Result};
use clap::Parser;
use std::path::{Path, PathBuf};

mod scss;

#[derive(Parser, Debug)]
#[command(name = "stylepack")]
struct Args {
    #[arg(short, long)]
    input: PathBuf,

    #[arg(short, long)]
    output: PathBuf,

    #[arg(long)]
    include: Vec<PathBuf>,

    #[arg(long)]
    minify: bool,
}

fn main() -> Result<()> {
    let args = Args::parse();

    if !args.input.exists() {
        bail!("input does not exist: {}", args.input.display());
    }

    let mut include = args.include.clone();
    if let Some(parent) = args.input.parent() {
        include.push(parent.to_path_buf());
    }

    let css = scss::compile_file(&args.input, &include)
        .with_context(|| format!("compile failed: {}", args.input.display()))?;

    let out_css = if args.minify {
        scss::minify_css(&css)
    } else {
        css
    };

    if let Some(parent) = args.output.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("mkdir: {}", parent.display()))?;
    }

    std::fs::write(&args.output, out_css)
        .with_context(|| format!("write: {}", args.output.display()))?;

    Ok(())
}
