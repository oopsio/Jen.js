/**
 * Asset optimization configuration schema.
 * Define how images, SVGs, and media should be optimized.
 */
export interface AssetOptimizeConfig {
  /** Enable automatic asset optimization */
  enabled?: boolean;

  /** Image optimization settings */
  images?: {
    /** Enable image optimization */
    enabled?: boolean;
    /** JPEG quality (0-100) */
    jpegQuality?: number;
    /** PNG compression level (0-9) */
    pngCompression?: number;
    /** Generate WebP format */
    webp?: boolean;
    /** Generate AVIF format (modern, high compression) */
    avif?: boolean;
    /** Generate multiple resolutions */
    resolutions?: number[];
    /** Max image width */
    maxWidth?: number;
  };

  /** SVG optimization settings */
  svg?: {
    /** Enable SVG optimization */
    enabled?: boolean;
    /** Minify SVG files */
    minify?: boolean;
    /** Remove metadata and comments */
    removeMetadata?: boolean;
  };

  /** Media (video/audio) settings */
  media?: {
    /** Enable media processing */
    enabled?: boolean;
    /** Generate streaming formats */
    streaming?: boolean;
    /** Extract metadata */
    extractMetadata?: boolean;
    /** Preload media assets */
    preload?: boolean;
  };

  /** CDN integration hooks */
  cdn?: {
    /** CDN provider name */
    provider?: "cloudinary" | "imgix" | "custom";
    /** Custom upload hook */
    uploadHook?: (asset: OptimizedAsset) => Promise<string>;
  };
}

/**
 * Represents an optimized asset with all variants and metadata.
 */
export interface OptimizedAsset {
  /** Original file path */
  originalPath: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Asset type */
  type: "image" | "svg" | "video" | "audio";
  /** Generated variants (original + optimized formats) */
  variants: AssetVariant[];
  /** Optimization metadata */
  metadata: AssetMetadata;
  /** Hash for cache-busting */
  hash: string;
}

/**
 * Single optimized variant of an asset.
 */
export interface AssetVariant {
  /** Format (original, webp, avif, etc.) */
  format: string;
  /** File size in bytes */
  size: number;
  /** File path relative to dist */
  path: string;
  /** Width (for images) */
  width?: number;
  /** Height (for images) */
  height?: number;
  /** Compression ratio */
  ratio?: number;
}

/**
 * Asset optimization metadata.
 */
export interface AssetMetadata {
  /** Optimization timestamp */
  timestamp: number;
  /** Original dimensions (for images) */
  dimensions?: { width: number; height: number };
  /** Media duration (for video/audio) */
  duration?: number;
  /** Codec information */
  codec?: string;
  /** Custom metadata */
  [key: string]: unknown;
}
