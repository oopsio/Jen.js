import path from "path";
import fs from "fs";
import { startProdServer } from "../server/prod.js";

export async function startCommand(args) {
  if (args.length === 0) {
    throw new Error("Missing output directory: preactsc start <outdir>");
  }

  const outDir = path.resolve(process.cwd(), args[0]);

  if (!fs.existsSync(outDir)) {
    throw new Error(`Output directory not found: ${outDir}`);
  }

  const serverPath = path.join(outDir, "server.js");
  if (!fs.existsSync(serverPath)) {
    throw new Error(`Server bundle not found: ${serverPath}`);
  }

  console.log(`[PRSC] Starting production server from: ${outDir}`);
  await startProdServer(outDir);
}
