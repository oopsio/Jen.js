import { h } from 'preact';

export interface ImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  className?: string;
  quality?: number;
}

/**
 * Jen.js Build-Time Optimized Image Component
 * Powered by Sharp. Instructs the Vite build pipeline to optimize the image for WebP compression and correct sizing.
 */
export function Image({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className,
  quality = 80,
}: ImageProps) {
  // If the src is an absolute URL (external), we ideally don't process it at build time unless we fetch it.
  // For local assets imported via Vite, we append hints to trigger the optimizer plugin.
  const isExternal = /^https?:\/\//.test(src);

  let finalSrc = src;
  if (!isExternal) {
    const queryChar = src.includes('?') ? '&' : '?';
    finalSrc = `${src}${queryChar}jen-img=1&q=${quality}${width ? `&w=${width}` : ''}`;
  }

  return h('img', {
    src: finalSrc,
    alt,
    width,
    height,
    loading,
    className,
    decoding: 'async',
    style: {
      maxWidth: '100%',
      height: 'auto',
      aspectRatio: width && height ? `${width} / ${height}` : undefined,
    },
  });
}
