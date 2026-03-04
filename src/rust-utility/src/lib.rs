use anyhow::{Result, Context};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::{Read, BufReader};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use std::time::Instant;

#[derive(Debug, Serialize, Deserialize)]
pub struct HashResult {
    pub path: String,
    pub hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HashResponse {
    pub ok: bool,
    #[serde(rename = "filesHashed")]
    pub files_hashed: usize,
    #[serde(rename = "durationMs")]
    pub duration_ms: u128,
    pub hashes: Vec<HashResult>,
    #[serde(rename = "fileNameHashes")]
    pub file_name_hashes: Vec<HashResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

pub fn hash_path(
    base_path: &str,
    algorithm: &str,
    hash_file_names: bool,
) -> Result<HashResponse> {
    let start = Instant::now();
    let root = PathBuf::from(base_path);
    
    if !root.exists() {
        return Err(anyhow::anyhow!("Path does not exist: {}", base_path));
    }

    let entries: Vec<PathBuf> = if root.is_dir() {
        WalkDir::new(&root)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .map(|e| e.path().to_path_buf())
            .collect()
    } else {
        vec![root.clone()]
    };

    let files_hashed = entries.len();

    let hashes: Vec<HashResult> = entries
        .par_iter()
        .map(|path| {
            let hash = hash_file_content(path, algorithm)?;
            let relative_path = path
                .strip_prefix(&root)
                .unwrap_or(path)
                .to_string_lossy()
                .to_string();
            
            Ok(HashResult {
                path: relative_path,
                hash,
            })
        })
        .collect::<Result<Vec<HashResult>>>()?;

    let mut file_name_hashes = Vec::new();
    if hash_file_names {
        file_name_hashes = entries
            .par_iter()
            .map(|path| {
                let file_name = path
                    .file_name()
                    .context("No file name")?
                    .to_string_lossy();
                let hash = hash_string(&file_name, algorithm);
                let relative_path = path
                    .strip_prefix(&root)
                    .unwrap_or(path)
                    .to_string_lossy()
                    .to_string();
                
                Ok(HashResult {
                    path: relative_path,
                    hash,
                })
            })
            .collect::<Result<Vec<HashResult>>>()?;
    }

    let duration_ms = start.elapsed().as_millis();

    Ok(HashResponse {
        ok: true,
        files_hashed,
        duration_ms,
        hashes,
        file_name_hashes,
        error: None,
    })
}

fn hash_file_content(path: &Path, algorithm: &str) -> Result<String> {
    if algorithm != "sha256" {
        return Err(anyhow::anyhow!("Unsupported algorithm: {}. Only sha256 is supported for now.", algorithm));
    }

    let file = File::open(path)?;
    let mut reader = BufReader::new(file);
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];

    while let Ok(n) = reader.read(&mut buffer) {
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }

    Ok(hex::encode(hasher.finalize()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_hash_string() {
        let h = hash_string("hello", "sha256");
        assert_eq!(h, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    }

    #[test]
    fn test_hash_path_single_file() -> Result<()> {
        let dir = tempdir()?;
        let file_path = dir.path().join("test.txt");
        fs::write(&file_path, "hello")?;

        let res = hash_path(file_path.to_str().unwrap(), "sha256", true)?;
        assert!(res.ok);
        assert_eq!(res.files_hashed, 1);
        assert_eq!(res.hashes[0].hash, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
        assert_eq!(res.file_name_hashes[0].hash, hash_string("test.txt", "sha256"));
        Ok(())
    }

    #[test]
    fn test_hash_path_directory() -> Result<()> {
        let dir = tempdir()?;
        fs::write(dir.path().join("a.txt"), "a")?;
        fs::write(dir.path().join("b.txt"), "b")?;

        let res = hash_path(dir.path().to_str().unwrap(), "sha256", false)?;
        assert!(res.ok);
        assert_eq!(res.files_hashed, 2);
        Ok(())
    }
}

fn hash_string(input: &str, _algorithm: &str) -> String {
    // For now only sha256
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}
