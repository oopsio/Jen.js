import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
function Home({ data }) {
  return /* @__PURE__ */ jsxs("main", { className: "home", children: [
    /* @__PURE__ */ jsxs("header", { className: "hero", children: [
      /* @__PURE__ */ jsx("h1", { children: "Welcome to Our Blog" }),
      /* @__PURE__ */ jsx("p", { className: "tagline", children: "Insights, stories, and tutorials" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "featured", children: [
      /* @__PURE__ */ jsx("h2", { children: "Latest Post" }),
      data.latestPost && /* @__PURE__ */ jsxs("article", { className: "post-card featured", children: [
        /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("a", { href: `/blog/${data.latestPost.slug}`, children: data.latestPost.title }) }),
        /* @__PURE__ */ jsxs("p", { className: "meta", children: [
          "By ",
          data.latestPost.author,
          " \u2022 ",
          data.latestPost.date,
          " \u2022 ",
          data.latestPost.views,
          " views"
        ] }),
        /* @__PURE__ */ jsx("p", { children: data.latestPost.excerpt }),
        /* @__PURE__ */ jsx("a", { href: `/blog/${data.latestPost.slug}`, className: "read-more", children: "Read More \u2192" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "all-posts", children: [
      /* @__PURE__ */ jsx("h2", { children: "All Posts" }),
      /* @__PURE__ */ jsx("div", { className: "posts-grid", children: data.posts.map((post) => /* @__PURE__ */ jsxs("article", { className: "post-card", children: [
        /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("a", { href: `/blog/${post.slug}`, children: post.title }) }),
        /* @__PURE__ */ jsxs("p", { className: "meta", children: [
          post.date,
          " \u2022 ",
          post.views,
          " views"
        ] }),
        /* @__PURE__ */ jsx("p", { children: post.excerpt }),
        /* @__PURE__ */ jsx("a", { href: `/blog/${post.slug}`, className: "read-more", children: "Read \u2192" })
      ] }, post.id)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "cta", children: [
      /* @__PURE__ */ jsx("h2", { children: "Subscribe to Updates" }),
      /* @__PURE__ */ jsx("p", { children: "Get the latest posts delivered to your inbox" }),
      /* @__PURE__ */ jsxs("form", { className: "newsletter-form", children: [
        /* @__PURE__ */ jsx("input", { type: "email", placeholder: "your@email.com", required: true }),
        /* @__PURE__ */ jsx("button", { type: "submit", children: "Subscribe" })
      ] })
    ] })
  ] });
}
function Head({ data }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("title", { children: "Blog - Insights & Tutorials" }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: "Read our latest blog posts about web development, design, and technology." }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: "Blog" }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: "Read our latest blog posts about web development, design, and technology." })
  ] });
}
async function loader(ctx) {
  const posts = [
    {
      id: "1",
      slug: "getting-started-with-jen-js",
      title: "Getting Started with Jen.js",
      excerpt: "Learn how to build your first app with Jen.js framework.",
      author: "Sarah Chen",
      date: "2026-01-26",
      views: 1523
    },
    {
      id: "2",
      slug: "building-production-apps",
      title: "Building Production-Grade Apps",
      excerpt: "Best practices for building scalable applications.",
      author: "Alex Rivera",
      date: "2026-01-25",
      views: 892
    },
    {
      id: "3",
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices",
      excerpt: "Master TypeScript patterns for better code.",
      author: "Jordan Park",
      date: "2026-01-24",
      views: 654
    }
  ];
  return {
    posts: posts.slice(1),
    totalPosts: posts.length,
    latestPost: posts[0]
  };
}
export {
  Head,
  Home as default,
  loader
};
