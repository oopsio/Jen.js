/**
 * Catch-all route for file paths
 * GET /api/files/[...path]
 * Matches: /api/files/a, /api/files/a/b/c, etc.
 */

import type { ApiRequest, ApiResponse } from "../../../../../src/api";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const { path } = req.params;

  // path is an array of segments
  // /api/files/docs/readme.md -> path = ['docs', 'readme.md']
  // /api/files/images/2024/photo.jpg -> path = ['images', '2024', 'photo.jpg']

  if (!Array.isArray(path) || path.length === 0) {
    return res.status(400).json({ error: "File path required" });
  }

  const filePath = path.join("/");
  const fileName = path[path.length - 1];
  const extension = fileName.split(".").pop() || "unknown";

  if (req.method === "GET") {
    res.status(200).json({
      path: filePath,
      segments: path,
      fileName,
      extension,
      size: Math.floor(Math.random() * 1000000), // Mock size
      mimeType: getMimeType(extension),
      lastModified: new Date().toISOString(),
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    json: "application/json",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    txt: "text/plain",
    md: "text/markdown",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    ts: "application/typescript",
    zip: "application/zip",
  };

  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}
