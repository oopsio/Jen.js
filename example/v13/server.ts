/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { createServer } from "node:http";

// @ts-ignore
import config from "./jen.config.ts";
import { createApp } from "../../src/server/app.js";
import { log } from "../../src/shared/log.js";

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
    log.info(
      `Server running: http://${config.server.hostname}:${config.server.port} (${isDev ? "DEV" : "PROD"})`,
    );
  });

  process.on("SIGINT", () => {
    log.warn("SIGINT received, shutting down...");
    server.close(() => process.exit(0));
  });
}

main();
