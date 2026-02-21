import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
export default function Home() {
  return _jsxs("div", {
    children: [
      _jsx("h1", { children: "Welcome to My SSR App" }),
      _jsx("p", { children: "This page is rendered on the server." }),
    ],
  });
}
