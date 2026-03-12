"use client";
import { jsx as _jsx } from "preact/jsx-runtime";
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
export function Image({ src, alt, width, height, loading = "lazy", className, }) {
    return (_jsx("picture", { children: _jsx("img", { src: src, alt: alt, width: width, height: height, loading: loading, className: className, decoding: "async" }) }));
}
