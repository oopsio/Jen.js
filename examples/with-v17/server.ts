import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import config from "./jen.config.ts";
import { createApp } from "../../src/server/app.ts";
import { log } from "../../src/shared/log.ts";
import { printBanner } from "../../src/cli/banner.ts";

const mode = process.argv[2] ?? "dev";
const isDev = mode === "dev";

async function main() {
  const app = await createApp({
    config,
    mode: isDev ? "dev" : "prod",
  });

  const server = createServer(async (req, res) => {
    try {
      await app.handle(req, res);
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Internal Server Error\n\n" + (err?.stack ?? String(err)));
    }
  });

  server.listen(config.server.port, config.server.hostname, () => {
    printBanner(config.server.port, isDev ? "development" : "production");
  });

  process.on("SIGINT", () => {
    log.warn("SIGINT received, shutting down...");
    server.close(() => process.exit(0));
  });
}

main();
