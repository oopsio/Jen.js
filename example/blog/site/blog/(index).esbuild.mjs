import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
function BlogIndex({ data, query }) {
  const page = parseInt(query.page || "1");
  return /* @__PURE__ */ jsxs("main", { className: "blog-index", children: [
    /* @__PURE__ */ jsxs("header", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { children: "Blog" }),
      /* @__PURE__ */ jsx("p", { children: "Latest articles and tutorials" })
    ] }),
    data.posts.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "posts-list", children: data.posts.map((post) => /* @__PURE__ */ jsxs("article", { className: "post-list-item", children: [
        /* @__PURE__ */ jsxs("div", { className: "post-meta", children: [
          /* @__PURE__ */ jsx("span", { className: "date", children: post.date }),
          /* @__PURE__ */ jsx("span", { className: "category", children: post.category }),
          /* @__PURE__ */ jsxs("span", { className: "views", children: [
            post.views,
            " views"
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("a", { href: `/blog/${post.slug}`, children: post.title }) }),
        /* @__PURE__ */ jsx("p", { className: "excerpt", children: post.excerpt }),
        /* @__PURE__ */ jsxs("footer", { children: [
          /* @__PURE__ */ jsxs("span", { className: "author", children: [
            "By ",
            post.author
          ] }),
          /* @__PURE__ */ jsx("a", { href: `/blog/${post.slug}`, className: "read-more", children: "Read Article \u2192" })
        ] })
      ] }, post.id)) }),
      /* @__PURE__ */ jsxs("nav", { className: "pagination", children: [
        page > 1 && /* @__PURE__ */ jsx("a", { href: `/blog?page=${page - 1}`, className: "prev", children: "\u2190 Previous" }),
        /* @__PURE__ */ jsxs("span", { className: "page-info", children: [
          "Page ",
          page,
          " of ",
          data.totalPages
        ] }),
        page < data.totalPages && /* @__PURE__ */ jsx("a", { href: `/blog?page=${page + 1}`, className: "next", children: "Next \u2192" })
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { className: "no-posts", children: "No posts found. Check back soon!" }),
    /* @__PURE__ */ jsx("nav", { className: "back-link", children: /* @__PURE__ */ jsx("a", { href: "/", children: "\u2190 Back Home" }) })
  ] });
}
function Head() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("title", { children: "Blog - All Posts" }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: "Read all our blog posts." })
  ] });
}
async function loader(ctx) {
  const page = parseInt(ctx.query.page || "1");
  const postsPerPage = 10;
  const allPosts = [
    {
      id: "1",
      slug: "getting-started-with-jen-js",
      title: "Getting Started with Jen.js",
      excerpt: "Learn how to build your first app with Jen.js framework.",
      author: "Sarah Chen",
      date: "2026-01-26",
      views: 1523,
      category: "Tutorial"
    },
    {
      id: "2",
      slug: "building-production-apps",
      title: "Building Production-Grade Apps",
      excerpt: "Best practices for building scalable applications.",
      author: "Alex Rivera",
      date: "2026-01-25",
      views: 892,
      category: "Best Practices"
    },
    {
      id: "3",
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices",
      excerpt: "Master TypeScript patterns for better code.",
      author: "Jordan Park",
      date: "2026-01-24",
      views: 654,
      category: "TypeScript"
    }
  ];
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  const startIdx = (page - 1) * postsPerPage;
  const posts = allPosts.slice(startIdx, startIdx + postsPerPage);
  return {
    posts,
    totalPages,
    currentPage: page
  };
}
export {
  Head,
  BlogIndex as default,
  loader
};
