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

import type { JenPlugin, PluginContext, PluginHookContext } from "../types.js";
import { HookStage } from "../types.js";

/**
 * Example CDN Upload Plugin for Jen.js
 *
 * This plugin demonstrates how to integrate with CDN services
 * to upload optimized assets after the build process.
 *
 * @example
 * ```typescript
 * // In jen.config.ts
 * import { cdnUploadPlugin } from "jenjs/plugins/cdn-upload";
 *
 * export default {
 *   // ... other config
 *   plugins: {
 *     plugins: [
 *       cdnUploadPlugin({
 *         provider: "cloudinary",
 *         apiKey: process.env.CLOUDINARY_API_KEY,
 *         apiSecret: process.env.CLOUDINARY_API_SECRET,
 *         cloudName: process.env.CLOUDINARY_CLOUD_NAME
 *       })
 *     ]
 *   }
 * };
 * ```
 */

interface CDNPluginConfig {
  provider: "cloudinary" | "imgix" | "aws-s3" | "custom";
  apiKey?: string;
  apiSecret?: string;
  cloudName?: string;
  bucket?: string;
  customUploadFn?: (file: { path: string; content: Buffer }) => Promise<string>;
}

/**
 * Create a CDN upload plugin.
 */
export function createCDNUploadPlugin(config: CDNPluginConfig): JenPlugin {
  return {
    name: "jen-cdn-upload",
    version: "1.0.0",
    description: "Upload optimized assets to CDN after build",

    async init(pluginContext: PluginContext) {
      console.log(`[CDN Plugin] Initialized with provider: ${config.provider}`);
    },

    hooks: {
      // Hook after build completes to upload assets
      [HookStage.AFTER_BUILD]: async (context: PluginHookContext) => {
        console.log("[CDN Plugin] Build completed, uploading assets...");

        // Get the list of optimized assets from the build context
        const { distDir } = context.config;
        const assets = (context.data?.assets as Array<{ path: string; content: Buffer }>) || [];

        for (const asset of assets) {
          try {
            const cdnUrl = await uploadAsset(asset, config);
            console.log(`[CDN Plugin] Uploaded: ${asset.path} → ${cdnUrl}`);

            // Update the asset URL in the manifest
            if (!context.data?.assetUrls) {
              context.data = { ...context.data, assetUrls: {} };
            }
            (context.data.assetUrls as Record<string, string>)[asset.path] = cdnUrl;
          } catch (error) {
            console.error(`[CDN Plugin] Failed to upload ${asset.path}:`, error);
            throw error;
          }
        }
      },

      // Hook to inject CDN URLs into HTML
      [HookStage.AFTER_RENDER]: async (context: PluginHookContext) => {
        const assetUrls = (context.data?.assetUrls as Record<string, string>) || {};

        if (Object.keys(assetUrls).length > 0) {
          // Update HTML with CDN URLs
          let html = context.data?.html as string;

          for (const [localPath, cdnUrl] of Object.entries(assetUrls)) {
            html = html?.replace(new RegExp(localPath, "g"), cdnUrl);
          }

          if (context.mutate) {
            context.mutate("html", html);
          }
        }
      },
    },
  };
}

/**
 * Upload a single asset to the configured CDN.
 */
async function uploadAsset(
  file: { path: string; content: Buffer },
  config: CDNPluginConfig
): Promise<string> {
  switch (config.provider) {
    case "cloudinary":
      return uploadToCloudinary(file, config);
    case "aws-s3":
      return uploadToS3(file, config);
    case "custom":
      if (config.customUploadFn) {
        return config.customUploadFn(file);
      }
      throw new Error("Custom upload function not provided");
    default:
      throw new Error(`Unsupported CDN provider: ${config.provider}`);
  }
}

/**
 * Upload to Cloudinary.
 */
async function uploadToCloudinary(
  file: { path: string; content: Buffer },
  config: CDNPluginConfig
): Promise<string> {
  // This is a mock implementation
  // In production, use the Cloudinary SDK
  const cloudName = config.cloudName || "demo";
  const filename = file.path.split("/").pop() || "asset";

  // Mock response - in reality, call Cloudinary API
  return `https://res.cloudinary.com/${cloudName}/image/upload/v1/${filename}`;
}

/**
 * Upload to AWS S3.
 */
async function uploadToS3(
  file: { path: string; content: Buffer },
  config: CDNPluginConfig
): Promise<string> {
  // This is a mock implementation
  // In production, use the AWS SDK
  const bucket = config.bucket || "my-assets";
  const key = file.path;

  // Mock response - in reality, call S3 API
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}
