import { h } from "preact";
import { useState } from "preact/hooks";

/**
 * Mixed Demo - Shows Preact, Vue, and Svelte working together
 *
 * This route demonstrates that you can use Preact routes
 * alongside Vue (.vue) and Svelte (.svelte) routes.
 */

export default function MixedDemo() {
  const [message, setMessage] = useState("Preact State Works!");

  return h("div", { class: "mixed-demo" }, [
    h("div", { class: "navbar" }, [
      h("h1", null, "🎭 Mixed Framework Demo"),
      h("p", { class: "nav-subtitle" }, "Preact, Vue, and Svelte together"),
    ]),

    h("div", { class: "container" }, [
      h("section", { class: "section" }, [
        h("h2", null, "Framework Integration"),
        h(
          "p",
          null,
          "This page is written in Preact (.tsx), while other pages use Vue (.vue) and Svelte (.svelte). They work seamlessly together.",
        ),
      ]),

      h("section", { class: "section" }, [
        h("h2", null, "Preact Route"),
        h(
          "p",
          null,
          "This demo page is a Preact component showing that traditional Preact routes still work perfectly.",
        ),

        h("div", { class: "demo-box" }, [
          h("h3", null, message),
          h(
            "button",
            {
              onClick: () => setMessage("Message updated from Preact hooks!"),
              class: "button",
            },
            "Click me (Preact Hooks)",
          ),
        ]),
      ]),

      h("section", { class: "section" }, [
        h("h2", null, "Architecture"),
        h("ul", null, [
          h("li", null, [
            h("strong", null, "Home Page"),
            " - Written in Vue (.vue)",
          ]),
          h("li", null, [
            h("strong", null, "Vue Demo"),
            " - Showcases Vue components",
          ]),
          h("li", null, [
            h("strong", null, "Svelte Demo"),
            " - Showcases Svelte components",
          ]),
          h("li", null, [
            h("strong", null, "Mixed Demo"),
            " - This page (Preact)",
          ]),
        ]),
      ]),

      h("section", { class: "section" }, [
        h("h2", null, "File Structure"),
        h("div", { class: "code-block" }, [
          h(
            "code",
            null,
            `site/
├── (home).vue              ← Vue route
├── (vue-demo).vue          ← Vue demo
├── (svelte-demo).svelte    ← Svelte demo
├── (mixed-demo).tsx        ← Preact route (this page)
├── components/
│   ├── VueCounter.vue
│   ├── VueCard.vue
│   ├── SvelteTimer.svelte
│   └── SvelteList.svelte
└── styles.scss`,
          ),
        ]),
      ]),

      h("section", { class: "section" }, [
        h("h2", null, "Compilation Process"),
        h("ol", null, [
          h("li", null, [
            h("strong", null, ".tsx files"),
            " → esbuild compiles to JS",
          ]),
          h("li", null, [
            h("strong", null, ".vue files"),
            " → @vue/compiler-sfc compiles to JS",
          ]),
          h("li", null, [
            h("strong", null, ".svelte files"),
            " → svelte/compiler compiles to JS",
          ]),
          h("li", null, [
            h("strong", null, ".scss files"),
            " → sass compiles to CSS",
          ]),
          h("li", null, [
            h("strong", null, "Result"),
            " → All combined into final HTML",
          ]),
        ]),
      ]),

      h("section", { class: "section" }, [
        h("h2", null, "Development Workflow"),
        h("ol", null, [
          h("li", null, "Start dev server: npm run dev"),
          h("li", null, "Edit any .vue, .svelte, or .tsx file"),
          h("li", null, "Browser automatically reloads (HMR)"),
          h("li", null, "Build for production: npm run build"),
        ]),
      ]),

      h("section", { class: "section" }, [
        h("h2", null, "Next Steps"),
        h("div", { class: "grid" }, [
          h("a", { href: "/", class: "button" }, "← Back to Home"),
          h("a", { href: "/(vue-demo)", class: "button secondary" }, "← Vue"),
          h(
            "a",
            { href: "/(svelte-demo)", class: "button secondary" },
            "Svelte →",
          ),
        ]),
      ]),
    ]),

    h("footer", null, [h("p", null, "jen.js v17 • Mixed Framework Demo")]),
  ]);
}

// Note: Import styles if needed
// import "./demo.scss";
