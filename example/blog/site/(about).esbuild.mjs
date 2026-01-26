import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
function About() {
  return /* @__PURE__ */ jsxs("main", { className: "about", children: [
    /* @__PURE__ */ jsx("header", { className: "page-header", children: /* @__PURE__ */ jsx("h1", { children: "About This Blog" }) }),
    /* @__PURE__ */ jsxs("article", { className: "about-content", children: [
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { children: "Our Mission" }),
        /* @__PURE__ */ jsx("p", { children: "We believe in sharing knowledge and helping developers build better applications. This blog is dedicated to providing practical insights, tutorials, and best practices for modern web development." })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { children: "What We Cover" }),
        /* @__PURE__ */ jsxs("ul", { children: [
          /* @__PURE__ */ jsx("li", { children: "Web framework tutorials" }),
          /* @__PURE__ */ jsx("li", { children: "TypeScript and JavaScript best practices" }),
          /* @__PURE__ */ jsx("li", { children: "Full-stack development patterns" }),
          /* @__PURE__ */ jsx("li", { children: "Performance optimization" }),
          /* @__PURE__ */ jsx("li", { children: "Developer productivity tips" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { children: "Meet the Authors" }),
        /* @__PURE__ */ jsxs("div", { className: "authors", children: [
          /* @__PURE__ */ jsxs("div", { className: "author", children: [
            /* @__PURE__ */ jsx("h3", { children: "Sarah Chen" }),
            /* @__PURE__ */ jsx("p", { children: "Full-stack developer with 8+ years of experience" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "author", children: [
            /* @__PURE__ */ jsx("h3", { children: "Alex Rivera" }),
            /* @__PURE__ */ jsx("p", { children: "DevOps engineer and cloud architecture specialist" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "author", children: [
            /* @__PURE__ */ jsx("h3", { children: "Jordan Park" }),
            /* @__PURE__ */ jsx("p", { children: "Frontend expert and TypeScript enthusiast" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { children: "Get In Touch" }),
        /* @__PURE__ */ jsx("p", { children: "Have feedback or want to contribute? Reach out to us:" }),
        /* @__PURE__ */ jsxs("ul", { children: [
          /* @__PURE__ */ jsx("li", { children: "Email: hello@example.com" }),
          /* @__PURE__ */ jsx("li", { children: "Twitter: @blogexample" }),
          /* @__PURE__ */ jsx("li", { children: "GitHub: github.com/blogexample" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "back-link", children: /* @__PURE__ */ jsx("a", { href: "/", children: "\u2190 Back to Blog" }) })
  ] });
}
function Head() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("title", { children: "About - Our Blog" }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: "Learn about our blog and the authors behind it." })
  ] });
}
export {
  Head,
  About as default
};
