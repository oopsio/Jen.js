import { Metadata } from '../types.js';

/**
 * Parses a Metadata configuration object into a formatted HTML string
 * ready to be injected directly into the document `<head>`.
 */
export function parseMetadata(meta?: Metadata): string {
  if (!meta) return '';

  let tags = '';

  if (meta.title) {
    tags += `<title>${meta.title}</title>\n`;
  }

  if (meta.description) {
    tags += `<meta name="description" content="${meta.description}">\n`;
  }

  if (meta.robots) {
    tags += `<meta name="robots" content="${meta.robots}">\n`;
  }

  if (meta.openGraph) {
    if (meta.openGraph.title)
      tags += `<meta property="og:title" content="${meta.openGraph.title}">\n`;
    if (meta.openGraph.description)
      tags += `<meta property="og:description" content="${meta.openGraph.description}">\n`;
    if (meta.openGraph.url)
      tags += `<meta property="og:url" content="${meta.openGraph.url}">\n`;
    if (meta.openGraph.siteName)
      tags += `<meta property="og:site_name" content="${meta.openGraph.siteName}">\n`;
    if (meta.openGraph.locale)
      tags += `<meta property="og:locale" content="${meta.openGraph.locale}">\n`;
    if (meta.openGraph.type)
      tags += `<meta property="og:type" content="${meta.openGraph.type}">\n`;

    if (meta.openGraph.images) {
      meta.openGraph.images.forEach((img) => {
        tags += `<meta property="og:image" content="${img.url}">\n`;
        if (img.width)
          tags += `<meta property="og:image:width" content="${img.width}">\n`;
        if (img.height)
          tags += `<meta property="og:image:height" content="${img.height}">\n`;
        if (img.alt)
          tags += `<meta property="og:image:alt" content="${img.alt}">\n`;
      });
    }
  }

  if (meta.twitter) {
    if (meta.twitter.card)
      tags += `<meta name="twitter:card" content="${meta.twitter.card}">\n`;
    if (meta.twitter.site)
      tags += `<meta name="twitter:site" content="${meta.twitter.site}">\n`;
    if (meta.twitter.creator)
      tags += `<meta name="twitter:creator" content="${meta.twitter.creator}">\n`;
  }

  // Handle arbitrary custom tags
  for (const key of Object.keys(meta)) {
    if (
      !['title', 'description', 'openGraph', 'twitter', 'robots'].includes(key)
    ) {
      if (typeof meta[key] === 'string') {
        tags += `<meta name="${key}" content="${meta[key]}">\n`;
      }
    }
  }

  return tags.trim();
}
