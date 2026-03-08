import { createServer } from "node:http";
import { createApp } from "../../src/server/app.js";
import config from "./jen.config.js";

async function start() {
  const app = await createApp({ config, mode: "dev" });

  const server = createServer(async (req, res) => {
    try {
      await app.handle(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end("Internal Error");
    }
  });

  server.listen(config.server.port, () => {
    console.log(`Server running at http://localhost:${config.server.port}`);
  });
}

start();
