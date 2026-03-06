import { IncomingMessage, ServerResponse } from "http";
import { rateLimiter } from "./rate-limiter.js";
import { validatePayload } from "./validator.js";
import { getCountryCode } from "./geo.js";
import { batchAndCommit } from "./github.js";

const isDev = process.env.NODE_ENV === "development";

export async function handleTelemetry(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (process.env.TELEMETRY_DISABLED === "1") {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Telemetry disabled" }));
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Get client IP
  const clientIp = getClientIp(req);

  // Check rate limit
  if (!rateLimiter.check(clientIp)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too many requests" }));
    return;
  }

  // Parse body
  let body = "";
  for await (const chunk of req) {
    body += chunk.toString();
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  // Validate payload
  const validation = validatePayload(payload);
  if (!validation.valid) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: validation.error }));
    return;
  }

  // Enrich with country
  const events = Array.isArray(payload) ? payload : [payload];
  const enrichedEvents = events.map((event) => ({
    ...event,
    country: getCountryCode(clientIp),
    timestamp: Math.floor(Date.now() / 1000),
  }));

  // Queue for batching
  try {
    await batchAndCommit(enrichedEvents);
  } catch (error) {
    if (isDev) console.error("Batch error:", error);
    // Don't fail the request - telemetry is fire-and-forget
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true }));
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}
