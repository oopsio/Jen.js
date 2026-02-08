import { createHash } from "crypto";

export function computeHash(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

export function computeFileHash(path: string, content: string): string {
  return createHash("sha256")
    .update(`${path}:${content}`)
    .digest("hex")
    .slice(0, 8);
}
