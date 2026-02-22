import { h, FunctionComponent, ComponentChild } from "preact";
import { useEffect } from "preact/hooks";

/**
 * Image component with lazy loading and responsive picture support
 *
 * @example
 * ```tsx
 * <Image src="/image.png" alt="Description" width={800} height={600} />
 * <Image src="/image.png" alt="Description" loading="eager" className="hero-image" />
 * ```
 */
interface ImageProps {
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
const Image: FunctionComponent<ImageProps> = ({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  className,
}) => {
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
};

/**
 * SEO metadata component for head injection
 *
 * @example
 * ```tsx
 * <Seo
 *   title="My Page"
 *   description="Page description"
 *   canonical="https://example.com/page"
 *   ogImage="https://example.com/og-image.png"
 * />
 * ```
 */
interface SeoProps {
  /** Page title */
  title: string;
  /** Meta description */
  description?: string;
  /** Meta keywords (comma-separated) */
  keywords?: string;
  /** Canonical URL */
  canonical?: string;
  /** Open Graph title */
  ogTitle?: string;
  /** Open Graph description */
  ogDescription?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Twitter card type: 'summary', 'summary_large_image', 'app', or 'player' */
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
}

/**
 * SEO component that injects meta tags into the document head
 *
 * @remarks
 * Works both server-side and client-side. On server, ensure this component
 * is rendered during SSR to include meta tags in the HTML head.
 * On client, uses DOM manipulation to update existing meta tags.
 */
const Seo: FunctionComponent<SeoProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
}) => {
  useEffect(() => {
    // Update title tag
    document.title = title;

    // Helper to set or create meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(
        `meta[${attr}="${name}"]`,
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }

      meta.content = content;
    };

    // Set meta tags
    if (description) setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Open Graph tags
    if (ogTitle) setMeta("og:title", ogTitle, true);
    if (ogDescription) setMeta("og:description", ogDescription, true);
    if (ogImage) setMeta("og:image", ogImage, true);
    setMeta("og:type", "website", true);

    // Twitter tags
    if (twitterCard) setMeta("twitter:card", twitterCard);
  }, [
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
  ]);

  // Server-side rendering: return meta tags
  // Note: In Jen.js SSR context, render these elements to be included in head
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && (
        <meta property="og:description" content={ogDescription} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
    </>
  );
};

/**
 * PWA (Progressive Web App) setup component
 *
 * @example
 * ```tsx
 * // With defaults
 * <PWA />
 *
 * // With custom paths
 * <PWA manifestPath="/app/manifest.json" swPath="/app/sw.js" />
 * ```
 */
interface PWAProps {
  /** Path to web app manifest (default: '/manifest.json') */
  manifestPath?: string;
  /** Path to service worker file (default: '/sw.js') */
  swPath?: string;
}

/**
 * PWA component that injects manifest link and registers service worker
 *
 * @remarks
 * Automatically registers the service worker on component mount.
 * Service worker errors are logged to console but don't break the app.
 */
const PWA: FunctionComponent<PWAProps> = ({
  manifestPath = "/manifest.json",
  swPath = "/sw.js",
}) => {
  useEffect(() => {
    // Register service worker in browser
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(swPath)
        .catch((err) =>
          console.error("Service worker registration failed:", err),
        );
    }
  }, [swPath]);

  return (
    <>
      <link rel="manifest" href={manifestPath} />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
    </>
  );
};

export { Image, Seo, PWA };
export type { ImageProps, SeoProps, PWAProps };
