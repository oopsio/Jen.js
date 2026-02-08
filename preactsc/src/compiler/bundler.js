import fs from "fs";
import path from "path";
import { build } from "esbuild";
import { generateClientBootloader } from "../runtime/client.js";
import { createManifest } from "../shared/manifest.js";

export async function bundleForDev(entryFile, components) {
  // For dev, we don't actually bundle - we just prepare the necessary data
  return {
    entry: entryFile,
    components,
  };
}

export async function bundleForProduction(entryFile, components, outDir) {
  // Security: Validate inputs
  if (!entryFile || typeof entryFile !== "string") {
    throw new Error("Invalid entry file");
  }

  if (!components || !Array.isArray(components.client)) {
    throw new Error("Invalid components");
  }

  if (!outDir || typeof outDir !== "string") {
    throw new Error("Invalid output directory");
  }

  try {
    // Build server bundle
    const serverResult = await build({
      entryPoints: [entryFile],
      bundle: true,
      format: "esm",
      outfile: path.join(outDir, "server.js"),
      platform: "node",
      target: "node18",
      external: ["preact", "preact-render-to-string"],
      jsx: "transform",
      jsxImportSource: "preact",
      conditions: ["node", "import"],
    });

    // Generate client bootloader
    const bootloaderCode = generateClientBootloader();

    // Build client bundle with bootloader + all client components
    const clientBundleContent = await bundleClientComponents(
      components.client,
      outDir,
    );

    // Security: Write with safe permissions (mode 0o644 for files, 0o755 for dirs)
    const serverPath = path.join(outDir, "server.js");
    const clientPath = path.join(outDir, "client.js");
    const manifestPath = path.join(outDir, "manifest.json");

    fs.writeFileSync(serverPath, clientBundleContent, { mode: 0o644 });
    fs.writeFileSync(clientPath, clientBundleContent, { mode: 0o644 });

    // Generate manifest
    const manifest = createManifest(components.client, outDir);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), {
      mode: 0o644,
    });

    return {
      server: serverPath,
      client: clientPath,
      manifest: manifestPath,
    };
  } catch (err) {
    throw new Error(`Bundle failed: ${err.message}`);
  }
}

async function bundleClientComponents(clientPaths, outDir) {
  if (!Array.isArray(clientPaths)) {
    throw new Error("clientPaths must be an array");
  }

  if (clientPaths.length === 0) {
    return generateClientBootloader();
  }

  try {
    const result = await build({
      entryPoints: clientPaths,
      bundle: true,
      format: "esm",
      splitting: true,
      outdir: path.join(outDir, ".client-chunks"),
      platform: "browser",
      target: "es2020",
      external: [],
      jsx: "transform",
      jsxImportSource: "preact",
      write: true,
    });

    // Read back the bundled files
    let bundledCode = generateClientBootloader();

    const chunkDir = path.join(outDir, ".client-chunks");
    if (fs.existsSync(chunkDir)) {
      const chunks = fs.readdirSync(chunkDir);
      for (const chunk of chunks.sort()) {
        // Security: Validate chunk filename to prevent path traversal
        if (
          chunk.includes("..") ||
          chunk.includes("/") ||
          chunk.includes("\\")
        ) {
          console.warn(`[PRSC] Skipping suspicious chunk: ${chunk}`);
          continue;
        }

        try {
          const content = fs.readFileSync(path.join(chunkDir, chunk), "utf-8");
          bundledCode += "\n" + content;
        } catch (err) {
          console.warn(`[PRSC] Failed to read chunk ${chunk}: ${err.message}`);
        }
      }
    }

    return bundledCode;
  } catch (err) {
    console.error("Error bundling client:", err.message);
    return generateClientBootloader();
  }
}

function createComponentId(filePath) {
  return path
    .basename(filePath)
    .replace(/\.[jt]sx?$/, "")
    .toLowerCase();
}
