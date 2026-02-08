// Plugin loader
// Migrated from Python src/python/plugins.py

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { log } from "../shared/log.js";

export interface Plugin {
  name: string;
  version?: string;
  onBuild?: () => void | Promise<void>;
  onServe?: () => void | Promise<void>;
  onDeploy?: () => void | Promise<void>;
}

const PLUGIN_DIR = "src/plugin/plugins";

export async function runPlugins(
  event: "build" | "serve" | "deploy" = "build",
) {
  log.info(`Running plugins (${event})...`);

  try {
    const files = readdirSync(PLUGIN_DIR);

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      const pluginPath = join(process.cwd(), PLUGIN_DIR, file);
      const pluginUrl = pathToFileURL(pluginPath).href;

      try {
        const module = (await import(pluginUrl)) as { default?: Plugin };
        const plugin = module.default;

        if (!plugin) continue;

        log.info(`  Loading plugin: ${plugin.name}`);

        if (event === "build" && plugin.onBuild) {
          await plugin.onBuild();
        } else if (event === "serve" && plugin.onServe) {
          await plugin.onServe();
        } else if (event === "deploy" && plugin.onDeploy) {
          await plugin.onDeploy();
        }
      } catch (err) {
        log.error(`  Plugin error: ${file} - ${String(err)}`);
      }
    }

    log.info("Plugins executed.");
  } catch (err) {
    log.warn(`Plugin directory not found: ${PLUGIN_DIR}`);
  }
}
