import { jsx, jsxs } from "preact/jsx-runtime";
function Home() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Welcome to Jen.js" }),
    /* @__PURE__ */ jsx("p", { children: "Static site generation with Preact" }),
    /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", { href: "https://github.com/kessud2021/Jen.js", children: "View on GitHub" }) })
  ] });
}
export {
  Home as default
};
