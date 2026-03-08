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
