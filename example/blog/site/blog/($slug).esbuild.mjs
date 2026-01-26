import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
function BlogPost({ data, params }) {
  return /* @__PURE__ */ jsxs("main", { className: "blog-post", children: [
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsxs("header", { className: "post-header", children: [
        /* @__PURE__ */ jsx("h1", { children: data.title }),
        /* @__PURE__ */ jsxs("div", { className: "post-meta", children: [
          /* @__PURE__ */ jsxs("span", { className: "author", children: [
            "By ",
            data.author
          ] }),
          /* @__PURE__ */ jsx("span", { className: "date", children: data.date }),
          /* @__PURE__ */ jsxs("span", { className: "read-time", children: [
            data.readTime,
            " min read"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "views", children: [
            data.views,
            " views"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "post-content", children: data.content.split("\n").map((paragraph, i) => paragraph.trim() && /* @__PURE__ */ jsx("p", { children: paragraph }, i)) }),
      /* @__PURE__ */ jsxs("footer", { className: "post-footer", children: [
        /* @__PURE__ */ jsx("div", { className: "post-info", children: /* @__PURE__ */ jsx("span", { className: "category", children: data.category }) }),
        /* @__PURE__ */ jsxs("div", { className: "sharing", children: [
          /* @__PURE__ */ jsx("h3", { children: "Share this post:" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "share-twitter", children: "Twitter" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "share-linkedin", children: "LinkedIn" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "share-facebook", children: "Facebook" })
        ] })
      ] })
    ] }),
    data.relatedPosts.length > 0 && /* @__PURE__ */ jsxs("section", { className: "related-posts", children: [
      /* @__PURE__ */ jsx("h2", { children: "Related Posts" }),
      /* @__PURE__ */ jsx("ul", { children: data.relatedPosts.map((post) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `/blog/${post.slug}`, children: post.title }) }, post.slug)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "newsletter-signup", children: [
      /* @__PURE__ */ jsx("h2", { children: "Subscribe for more posts" }),
      /* @__PURE__ */ jsxs("form", { children: [
        /* @__PURE__ */ jsx("input", { type: "email", placeholder: "your@email.com", required: true }),
        /* @__PURE__ */ jsx("button", { type: "submit", children: "Subscribe" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "post-nav", children: /* @__PURE__ */ jsx("a", { href: "/blog", className: "back", children: "\u2190 Back to Blog" }) })
  ] });
}
function Head({ data }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("title", { children: [
      data.title,
      " - Blog"
    ] }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: data.content.substring(0, 160) }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: data.title }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: "article" }),
    /* @__PURE__ */ jsx("meta", { name: "author", content: data.author }),
    /* @__PURE__ */ jsx("meta", { name: "article:published_time", content: data.date })
  ] });
}
async function loader(ctx) {
  const { slug } = ctx.params;
  const posts = {
    "getting-started-with-jen-js": {
      id: "1",
      slug: "getting-started-with-jen-js",
      title: "Getting Started with Jen.js",
      content: `
Jen.js is a powerful TypeScript-first framework for building modern web applications.

In this tutorial, we'll cover the basics of setting up a Jen.js project, creating your first pages, and deploying to production.

First, install the framework and create your initial pages using file-based routing. The framework automatically discovers routes from your site directory.

Then, add dynamic content using the loader() function to fetch data server-side. This keeps your application performant and SEO-friendly.

Finally, deploy using the bundling system to create a production-ready distribution.`,
      author: "Sarah Chen",
      date: "2026-01-26",
      views: 1523,
      readTime: 5,
      category: "Tutorial",
      relatedPosts: [
        { slug: "building-production-apps", title: "Building Production-Grade Apps" },
        { slug: "typescript-best-practices", title: "TypeScript Best Practices" }
      ]
    },
    "building-production-apps": {
      id: "2",
      slug: "building-production-apps",
      title: "Building Production-Grade Apps",
      content: `
Building applications for production requires careful planning and best practices.

Key considerations include error handling, performance optimization, security, and scalability.

Start with proper TypeScript configuration for strict type checking. This catches errors early in development.

Then implement comprehensive error handling with try-catch blocks and proper logging.

Finally, optimize your build with bundling and minification to reduce file sizes.`,
      author: "Alex Rivera",
      date: "2026-01-25",
      views: 892,
      readTime: 8,
      category: "Best Practices",
      relatedPosts: [
        { slug: "typescript-best-practices", title: "TypeScript Best Practices" }
      ]
    },
    "typescript-best-practices": {
      id: "3",
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices",
      content: `
TypeScript provides powerful type system features that can make your code more robust.

Use strict mode in your tsconfig.json to enforce strict type checking throughout your project.

Always type your function parameters and return values. This makes your code self-documenting.

Use interfaces for object shapes and types for unions and intersections.

Avoid using 'any' - use 'unknown' when you truly don't know the type, then narrow it down.`,
      author: "Jordan Park",
      date: "2026-01-24",
      views: 654,
      readTime: 6,
      category: "TypeScript",
      relatedPosts: [
        { slug: "getting-started-with-jen-js", title: "Getting Started with Jen.js" }
      ]
    }
  };
  const post = posts[slug];
  if (!post) {
    return {
      id: "404",
      slug: "not-found",
      title: "Post Not Found",
      content: "The post you're looking for doesn't exist.",
      author: "System",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      views: 0,
      readTime: 0,
      category: "Error",
      relatedPosts: []
    };
  }
  return post;
}
export {
  Head,
  BlogPost as default,
  loader
};
