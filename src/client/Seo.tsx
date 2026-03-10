'use client';

import { h, type VNode } from "preact";
import { useEffect } from "preact/hooks";

export interface SeoProps {
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
 * @example
 * ```tsx
 * <Seo
 *   title="My Page"
 *   description="Page description"
 *   canonical="https://example.com/page"
 *   ogImage="https://example.com/og-image.png"
 * />
 * ```
 *
 * @remarks
 * Works both server-side and client-side. On server, ensure this component
 * is rendered during SSR to include meta tags in the HTML head.
 * On client, uses DOM manipulation to update existing meta tags.
 */
export function Seo({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
}: SeoProps): VNode {
  useEffect(() => {
    // Update title tag
    document.title = title;

    // Helper to set or create meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(
        `meta[${attr}="${name}"]`,
      ) as HTMLMetaElement | null;

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
      ) as HTMLLinkElement | null;
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
}
