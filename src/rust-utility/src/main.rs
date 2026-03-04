use serde::Deserialize;
use std::io::{self, Read};
use jenjs_rust_util::{hash_path, HashResponse};

#[derive(Debug, Deserialize)]
struct InputRequest {
    command: String,
    path: String,
    #[serde(default = "default_algorithm")]
    algorithm: String,
    #[serde(rename = "hashFileNames", default)]
    hash_file_names: bool,
}

fn default_algorithm() -> String {
    "sha256".to_string()
}

fn main() {
    let mut buffer = String::new();
    let res = if let Ok(n) = io::stdin().read_to_string(&mut buffer) {
        if n > 0 {
            // Try to parse as JSON
            match serde_json::from_str::<InputRequest>(&buffer) {
                Ok(req) => {
                    if req.command == "hash" {
                        hash_path(&req.path, &req.algorithm, req.hash_file_names)
                            .unwrap_or_else(|e| error_response(e.to_string()))
                    } else {
                        error_response(format!("Unknown command: {}", req.command))
                    }
                }
                Err(e) => {
                    // Maybe it's not JSON, try to handle as CLI args?
                    // For now, only JSON is supported for complexity
                    error_response(format!("Invalid JSON input: {}", e))
                }
            }
        } else {
            // No stdin, check CLI args
            let args: Vec<String> = std::env::args().collect();
            if args.len() > 1 {
                // simple CLI: hash <path>
                if args[1] == "hash" && args.len() > 2 {
                    hash_path(&args[2], "sha256", false)
                        .unwrap_or_else(|e| error_response(e.to_string()))
                } else {
                    error_response("Usage: hash <path> or provide JSON via stdin".to_string())
                }
            } else {
                error_response("No input provided".to_string())
            }
        }
    } else {
        error_response("Failed to read from stdin".to_string())
    };

    println!("{}", serde_json::to_string(&res).unwrap());
}

fn error_response(msg: String) -> HashResponse {
    HashResponse {
        ok: false,
        files_hashed: 0,
        duration_ms: 0,
        hashes: Vec::new(),
        file_name_hashes: Vec::new(),
        error: Some(msg),
    }
}
