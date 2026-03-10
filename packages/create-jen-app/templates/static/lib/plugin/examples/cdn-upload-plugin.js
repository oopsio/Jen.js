import { HookStage } from "../types.js";
/**
 * Create a CDN upload plugin.
 */
export function createCDNUploadPlugin(config) {
  return {
    name: "jen-cdn-upload",
    version: "1.0.0",
    description: "Upload optimized assets to CDN after build",
    async init(pluginContext) {
      console.log(`[CDN Plugin] Initialized with provider: ${config.provider}`);
    },
    hooks: {
      // Hook after build completes to upload assets
      [HookStage.AFTER_BUILD]: async (context) => {
        console.log("[CDN Plugin] Build completed, uploading assets...");
        // Get the list of optimized assets from the build context
        const { distDir } = context.config;
        const assets = context.data?.assets || [];
        for (const asset of assets) {
          try {
            const cdnUrl = await uploadAsset(asset, config);
            console.log(`[CDN Plugin] Uploaded: ${asset.path} → ${cdnUrl}`);
            // Update the asset URL in the manifest
            if (!context.data?.assetUrls) {
              context.data = { ...context.data, assetUrls: {} };
            }
            context.data.assetUrls[asset.path] = cdnUrl;
          } catch (error) {
            console.error(
              `[CDN Plugin] Failed to upload ${asset.path}:`,
              error,
            );
            throw error;
          }
        }
      },
      // Hook to inject CDN URLs into HTML
      [HookStage.AFTER_RENDER]: async (context) => {
        const assetUrls = context.data?.assetUrls || {};
        if (Object.keys(assetUrls).length > 0) {
          // Update HTML with CDN URLs
          let html = context.data?.html;
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
async function uploadAsset(file, config) {
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
async function uploadToCloudinary(file, config) {
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
async function uploadToS3(file, config) {
  // This is a mock implementation
  // In production, use the AWS SDK
  const bucket = config.bucket || "my-assets";
  const key = file.path;
  // Mock response - in reality, call S3 API
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}
