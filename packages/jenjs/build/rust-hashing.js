import { spawn } from "node:child_process";
import { join } from "node:path";
import { readdirSync, existsSync } from "node:fs";
/**
 * High-performance hashing using Rust utility
 */
export async function hashWithRust(options) {
    return new Promise((resolve, reject) => {
        // Binary is expected in lib/ relative to the project root
        const libDir = join(process.cwd(), "lib");
        if (!existsSync(libDir)) {
            reject(new Error(`Binary directory not found: ${libDir}`));
            return;
        }
        // Look for a file named 'utils' with any extension (e.g. utils.exe, utils.bin, or just utils)
        let binaryName;
        try {
            const files = readdirSync(libDir);
            binaryName = files.find((f) => f === "utils" || f.startsWith("utils."));
        }
        catch (err) {
            reject(new Error(`Failed to list binary directory: ${err.message}`));
            return;
        }
        if (!binaryName) {
            reject(new Error(`Could not find 'utils' binary in ${libDir}. Ensure the Rust utility is compiled and placed in lib/.`));
            return;
        }
        const binaryPath = join(libDir, binaryName);
        const child = spawn(binaryPath, [], {
            stdio: ["pipe", "pipe", "inherit"],
        });
        let stdout = "";
        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        child.on("error", (err) => {
            reject(new Error(`Failed to start Rust utility: ${err.message}`));
        });
        child.on("close", (code) => {
            if (code !== 0 && !stdout) {
                reject(new Error(`Rust utility exited with code ${code}`));
                return;
            }
            try {
                const response = JSON.parse(stdout);
                if (response.ok) {
                    resolve(response);
                }
                else {
                    reject(new Error(response.error || "Unknown error from Rust utility"));
                }
            }
            catch (e) {
                reject(new Error(`Failed to parse Rust utility output: ${stdout}`));
            }
        });
        // Send command via stdin
        const request = {
            command: "hash",
            path: options.path,
            algorithm: options.algorithm || "sha256",
            hashFileNames: options.hashFileNames || false,
        };
        child.stdin.write(JSON.stringify(request));
        child.stdin.end();
    });
}
