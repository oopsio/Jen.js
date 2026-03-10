import { h, VNode } from "preact";

export interface GoogleMapsEmbedProps {
  /** Google Maps embed URL or place ID */
  src: string;
  /** Width of the embed (default: 400) */
  width?: number | string;
  /** Height of the embed (default: 300) */
  height?: number | string;
  /** Map style (default: "border:0;") */
  style?: string;
  /** Allow fullscreen (default: true) */
  allowFullscreen?: boolean;
  /** Loading strategy (default: "lazy") */
  loading?: "lazy" | "eager";
  /** Additional CSS classes */
  class?: string;
  /** Map title for accessibility */
  title?: string;
}

/**
 * Google Maps Embed Component
 *
 * @example
 * ```tsx
 * <GoogleMaps src="https://www.google.com/maps/embed?pb=!1m18!1m12..." />
 * <GoogleMaps
 *   src="https://www.google.com/maps/embed?pb=..."
 *   width="100%"
 *   height={500}
 *   title="Google Map of New York"
 * />
 * ```
 */
export function GoogleMaps({
  src,
  width = 400,
  height = 300,
  style = "border:0;",
  allowFullscreen = true,
  loading = "lazy",
  class: className,
  title = "Google Map",
}: GoogleMapsEmbedProps): VNode {
  if (!src) {
    throw new Error("GoogleMaps src is required");
  }

  return (
    <iframe
      class={className}
      width={width}
      height={height}
      style={style}
      src={src}
      allowFullScreen={allowFullscreen}
      loading={loading}
      referrerPolicy="no-referrer-when-downgrade"
      title={title}
    />
  );
}
