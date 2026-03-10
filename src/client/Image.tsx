"use client";

import { h, type VNode } from "preact";

export interface ImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Loading strategy: 'lazy' (default) or 'eager' */
  loading?: "lazy" | "eager";
  /** CSS class name */
  className?: string;
}

/**
 * Image component that renders a responsive picture element with lazy loading support
 *
 * @example
 * ```tsx
 * <Image src="/image.png" alt="Description" width={800} height={600} />
 * <Image src="/image.png" alt="Description" loading="eager" className="hero-image" />
 * ```
 *
 * @remarks
 * Future enhancement: Add WebP and AVIF format support via source elements
 * Example with future format support:
 * ```tsx
 * <picture>
 *   <source srcSet="image.avif" type="image/avif" />
 *   <source srcSet="image.webp" type="image/webp" />
 *   <img src="image.png" ... />
 * </picture>
 * ```
 */
export function Image({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  className,
}: ImageProps): VNode {
  return (
    <picture>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        decoding="async"
      />
    </picture>
  );
}
