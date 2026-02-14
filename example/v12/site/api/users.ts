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

import { DB } from "../../../../src/db";
import type { IncomingMessage, ServerResponse } from "http";

export async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "POST") {
    const body = await new Promise<string>((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
    });

    const { name, email } = JSON.parse(body);

    const db = new DB({
      type: "jdb",
      jdb: { root: "./data" },
    });

    await db.connect();
    const user = await db.create("users", { name, email });

    res.writeHead(201, { "content-type": "application/json" });
    res.end(JSON.stringify(user));
  }
}
