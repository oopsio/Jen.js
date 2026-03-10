'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect } from "preact/hooks";
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
export function Seo({ title, description, keywords, canonical, ogTitle, ogDescription, ogImage, twitterCard, }) {
    useEffect(() => {
        // Update title tag
        document.title = title;
        // Helper to set or create meta tags
        const setMeta = (name, content, property = false) => {
            const attr = property ? "property" : "name";
            let meta = document.querySelector(`meta[${attr}="${name}"]`);
            if (!meta) {
                meta = document.createElement("meta");
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };
        // Set meta tags
        if (description)
            setMeta("description", description);
        if (keywords)
            setMeta("keywords", keywords);
        if (canonical) {
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement("link");
                link.rel = "canonical";
                document.head.appendChild(link);
            }
            link.href = canonical;
        }
        // Open Graph tags
        if (ogTitle)
            setMeta("og:title", ogTitle, true);
        if (ogDescription)
            setMeta("og:description", ogDescription, true);
        if (ogImage)
            setMeta("og:image", ogImage, true);
        setMeta("og:type", "website", true);
        // Twitter tags
        if (twitterCard)
            setMeta("twitter:card", twitterCard);
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
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: title }), description && _jsx("meta", { name: "description", content: description }), keywords && _jsx("meta", { name: "keywords", content: keywords }), canonical && _jsx("link", { rel: "canonical", href: canonical }), ogTitle && _jsx("meta", { property: "og:title", content: ogTitle }), ogDescription && (_jsx("meta", { property: "og:description", content: ogDescription })), ogImage && _jsx("meta", { property: "og:image", content: ogImage }), _jsx("meta", { property: "og:type", content: "website" }), twitterCard && _jsx("meta", { name: "twitter:card", content: twitterCard })] }));
}
