import type { FrameworkConfig } from "jenjs";

const config: FrameworkConfig = {
  siteDir: "site",
  distDir: "dist",

  routes: {
    fileExtensions: [".tsx", ".jsx", ".ts", ".js"],
    routeFilePattern: /^\((.+)\)\.(t|j)sx?$/,
    enableIndexFallback: true,
  },

  rendering: {
    defaultMode: "ssg",
    defaultRevalidateSeconds: 3600, // Revalidate hourly
  },

  inject: {
    head: [
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      `<meta name="theme-color" content="#0066cc">`,
      `<style>header,main{padding:var(--spacing-2xl) var(--spacing-xl)}.post-card .meta,.posts-list .post-list-item .post-meta{margin-bottom:var(--spacing-md);font-size:.9rem;color:var(--gray-500)}:root{--primary:#06c;--secondary:#0a6;--danger:#c00;--gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;--gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;--spacing-xs:0.25rem;--spacing-sm:0.5rem;--spacing-md:1rem;--spacing-lg:1.5rem;--spacing-xl:2rem;--spacing-2xl:3rem}*{margin:0;padding:0;box-sizing:border-box}html{font-size:16px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.6;color:var(--gray-800);background-color:#fff}h1,h2,h3,h4,h5,h6{font-weight:600;margin-bottom:var(--spacing-md);color:var(--gray-900)}.back-link a,button{font-weight:500}h1{font-size:2.5rem;line-height:1.2}h2{font-size:2rem;margin-top:var(--spacing-xl)}h3{font-size:1.5rem}p{margin-bottom:var(--spacing-md)}a{color:var(--primary);text-decoration:none;transition:color .2s}a:hover{color:#0052a3;text-decoration:underline}main{max-width:900px;margin:0 auto}header{background:linear-gradient(135deg,var(--primary),#0052a3);color:#fff;margin-bottom:var(--spacing-2xl);text-align:center}header h1{color:#fff;margin-bottom:var(--spacing-md)}header .tagline{font-size:1.2rem;opacity:.95}.page-header{background:var(--gray-50);padding:var(--spacing-xl);margin:-var(--spacing-2xl) -var(--spacing-xl) var(--spacing-2xl);border-bottom:1px solid var(--gray-200)}.blog-post article .post-content,.blog-post article .post-header,.posts-grid,.posts-list{margin-bottom:var(--spacing-2xl)}.blog-post .related-posts ul li,.page-header h1{margin-bottom:var(--spacing-sm)}.posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--spacing-lg)}.post-card{border:1px solid var(--gray-200);border-radius:8px;padding:var(--spacing-lg);transition:.2s;background:#fff}.post-card:hover{border-color:var(--primary);box-shadow:0 4px 12px rgba(0,102,204,.1);transform:translateY(-2px)}.blog-post .related-posts h2,.post-card h3{margin-top:0}.post-card .read-more{display:inline-block;margin-top:var(--spacing-md);font-weight:500}.post-card.featured{background:linear-gradient(135deg,rgba(0,102,204,.05),rgba(0,170,102,.05));border-color:var(--primary)}.posts-list .post-list-item{padding:var(--spacing-lg);border-bottom:1px solid var(--gray-200)}.posts-list .post-list-item:last-child{border-bottom:none}.posts-list .post-list-item h2{margin-top:0;font-size:1.5rem}.posts-list .post-list-item .post-meta{display:flex;gap:var(--spacing-md)}.posts-list .post-list-item .post-meta .category{background:var(--gray-100);padding:2px 8px;border-radius:4px}.posts-list .post-list-item footer{display:flex;justify-content:space-between;align-items:center;margin-top:var(--spacing-md)}.blog-post article{line-height:1.8}.blog-post article .post-header{padding-bottom:var(--spacing-xl);border-bottom:2px solid var(--gray-200)}.blog-post article .post-header h1{margin-top:0;margin-bottom:var(--spacing-lg)}.blog-post article .post-header .post-meta{display:flex;flex-wrap:wrap;gap:var(--spacing-lg);font-size:.95rem;color:var(--gray-600)}.blog-post article .post-content p{margin-bottom:var(--spacing-lg)}.blog-post article .post-footer{border-top:1px solid var(--gray-200);padding-top:var(--spacing-xl);margin-top:var(--spacing-2xl)}.blog-post .related-posts{background:var(--gray-50);padding:var(--spacing-xl);border-radius:8px;margin:var(--spacing-2xl) 0}.blog-post .related-posts ul{list-style:none}.blog-post .related-posts ul li a{display:block;padding:var(--spacing-sm);border-radius:4px;transition:background .2s}.blog-post .related-posts ul li a:hover{background:var(--gray-100)}button,input[type=email],input[type=text]{padding:var(--spacing-sm) var(--spacing-md);font-size:1rem;border:1px solid var(--gray-300);border-radius:4px;font-family:inherit}input[type=email],input[type=text]{width:100%;max-width:400px}input[type=email]:focus,input[type=text]:focus{outline:0;border-color:var(--primary);box-shadow:0 0 0 3px rgba(0,102,204,.1)}button{background:var(--primary);color:#fff;border:none;cursor:pointer;transition:background .2s}button:hover{background:#0052a3}button:active{transform:scale(.98)}.newsletter-form{display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-lg)}.pagination{display:flex;justify-content:center;align-items:center;gap:var(--spacing-lg);margin:var(--spacing-2xl) 0}.pagination a{padding:var(--spacing-sm) var(--spacing-lg);border:1px solid var(--gray-300);border-radius:4px;transition:.2s}.pagination a:hover{border-color:var(--primary);background:var(--gray-50)}.pagination .page-info{color:var(--gray-600)}.back-link{margin-top:var(--spacing-xl);padding-top:var(--spacing-xl);border-top:1px solid var(--gray-200)}@media (max-width:768px){main{padding:var(--spacing-lg) var(--spacing-md)}h1{font-size:2rem}h2{font-size:1.5rem}.posts-grid{grid-template-columns:1fr}.posts-meta{flex-direction:column;gap:var(--spacing-sm)}.newsletter-form{flex-direction:column}.newsletter-form input{max-width:100%}}</style>`,
    ],
    bodyEnd: [`<!-- Analytics placeholder -->`],
  },

  css: {
    globalScss: "site/styles/global.css",
  },

  assets: {
    publicDir: "site/assets",
    cacheControl: "public, max-age=31536000, immutable",
  },

  server: {
    port: 3000,
    hostname: "0.0.0.0",
  },
};

export default config;
