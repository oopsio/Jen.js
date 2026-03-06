import { request } from "http";
import { request as httpsRequest } from "https";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";

interface TelemetryEvent {
  framework?: string;
  version?: string;
  command?: string;
  os?: string;
  country?: string;
  timestamp?: number;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === "development";
let batchQueue: TelemetryEvent[] = [];
let commitTimeout: NodeJS.Timeout | null = null;
const BATCH_INTERVAL = 60 * 1000; // Commit every minute or when batch reaches limit
const BATCH_SIZE = 100;

export async function batchAndCommit(
  events: TelemetryEvent[]
): Promise<void> {
  batchQueue.push(...events);

  // Immediate commit if batch is large
  if (batchQueue.length >= BATCH_SIZE) {
    await flushBatch();
    return;
  }

  // Schedule batched commit
  if (!commitTimeout) {
    commitTimeout = setTimeout(flushBatch, BATCH_INTERVAL);
  }
}

async function flushBatch(): Promise<void> {
  if (commitTimeout) {
    clearTimeout(commitTimeout);
    commitTimeout = null;
  }

  if (batchQueue.length === 0) {
    return;
  }

  const events = batchQueue;
  batchQueue = [];

  try {
    await commitToGithub(events);
  } catch (error) {
    if (isDev) {
      console.error("Failed to commit telemetry:", error);
    }
    // Re-queue failed events
    batchQueue.unshift(...events);
  }
}

async function commitToGithub(events: TelemetryEvent[]): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const owner = process.env.GITHUB_OWNER;

  if (!token || !repo || !owner) {
    if (isDev) {
      console.warn("GitHub credentials not configured, skipping commit");
      return;
    }
    throw new Error("Missing GitHub configuration");
  }

  // File path: telemetry/YYYY-MM-DD.json
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const filePath = `telemetry/${date}.json`;

  // Prepare content
  const fileContent = JSON.stringify(events, null, 2);
  const contentBase64 = Buffer.from(fileContent).toString("base64");

  // Get current file SHA (for update)
  const sha = await getFileSha(token, owner, repo, filePath);

  // Commit
  await createOrUpdateFile(token, owner, repo, filePath, contentBase64, sha);
}

async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: "api.github.com",
      port: 443,
      path: `/repos/${owner}/${repo}/contents/${path}`,
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "jenjs-telemetry",
        Accept: "application/vnd.github.v3+json",
      },
    };

    const req = httpsRequest(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            resolve(json.sha);
          } else {
            resolve(null); // File doesn't exist yet
          }
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", () => {
      resolve(null);
    });

    req.end();
  });
}

async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha: string | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload = {
      message: `telemetry: update ${path}`,
      content: content,
      ...(sha && { sha }),
    };

    const body = JSON.stringify(payload);

    const options = {
      hostname: "api.github.com",
      port: 443,
      path: `/repos/${owner}/${repo}/contents/${path}`,
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "jenjs-telemetry",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = httpsRequest(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve();
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Cleanup on process exit
process.on("exit", () => {
  if (batchQueue.length > 0 && !isDev) {
    // Try synchronous write as fallback
    try {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const filePath = resolve(`./telemetry-backup-${date}.json`);
      writeFileSync(filePath, JSON.stringify(batchQueue, null, 2));
    } catch {
      // Silently fail - telemetry is best effort
    }
  }
});
