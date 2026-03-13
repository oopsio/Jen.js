import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect } from "preact/hooks";
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
const Image = ({ src, alt, width, height, loading = "lazy", className, }) => {
    return (_jsx("picture", { children: _jsx("img", { src: src, alt: alt, width: width, height: height, loading: loading, className: className, decoding: "async" }) }));
};
/**
 * SEO component that injects meta tags into the document head
 *
 * @remarks
 * Works both server-side and client-side. On server, ensure this component
 * is rendered during SSR to include meta tags in the HTML head.
 * On client, uses DOM manipulation to update existing meta tags.
 */
const Seo = ({ title, description, keywords, canonical, ogTitle, ogDescription, ogImage, twitterCard, }) => {
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
};
/**
 * PWA component that injects manifest link and registers service worker
 *
 * @remarks
 * Automatically registers the service worker on component mount.
 * Service worker errors are logged to console but don't break the app.
 */
const PWA = ({ manifestPath = "/manifest.json", swPath = "/sw.js", }) => {
    useEffect(() => {
        // Register service worker in browser
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register(swPath)
                .catch((err) => console.error("Service worker registration failed:", err));
        }
    }, [swPath]);
    return (_jsxs(_Fragment, { children: [_jsx("link", { rel: "manifest", href: manifestPath }), _jsx("meta", { name: "theme-color", content: "#000000" }), _jsx("meta", { name: "apple-mobile-web-app-capable", content: "yes" }), _jsx("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" })] }));
};
export { Image, Seo, PWA };
