import { h, VNode } from "preact";

export interface YouTubeEmbedProps {
  /** YouTube video ID (without the "v=" parameter) */
  videoId: string;
  /** Width of the embed (default: 560) */
  width?: number | string;
  /** Height of the embed (default: 315) */
  height?: number | string;
  /** Allow fullscreen (default: true) */
  allowFullscreen?: boolean;
  /** Video title for accessibility (default: "YouTube video player") */
  title?: string;
  /** Additional CSS classes */
  class?: string;
  /** Start time in seconds (optional) */
  startTime?: number;
  /** Enable controls (default: true) */
  controls?: boolean;
  /** Allow modestbranding (default: false) */
  modestBranding?: boolean;
  /** Privacy-enhanced mode (use youtube-nocookie.com) (default: false) */
  privacyMode?: boolean;
}

/**
 * YouTube Embed Component
 *
 * @example
 * ```tsx
 * <YouTube videoId="dQw4w9WgXcQ" />
 * <YouTube videoId="dQw4w9WgXcQ" width="100%" height={400} startTime={10} />
 * <YouTube videoId="dQw4w9WgXcQ" privacyMode width="100%" />
 * ```
 */
export function YouTube({
  videoId,
  width = 560,
  height = 315,
  allowFullscreen = true,
  title = "YouTube video player",
  class: className,
  startTime,
  controls = true,
  modestBranding = false,
  privacyMode = false,
}: YouTubeEmbedProps): VNode {
  if (!videoId) {
    throw new Error("YouTube videoId is required");
  }

  const domain = privacyMode ? "youtube-nocookie.com" : "youtube.com";
  const params = new URLSearchParams();

  params.set("controls", controls ? "1" : "0");
  if (modestBranding) {
    params.set("modestbranding", "1");
  }
  if (startTime && startTime > 0) {
    params.set("start", String(startTime));
  }

  const src = `https://www.${domain}/embed/${videoId}?${params.toString()}`;

  return (
    <iframe
      class={className}
      width={width}
      height={height}
      src={src}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen={allowFullscreen}
      loading="lazy"
      style="border: 0;"
    />
  );
}
