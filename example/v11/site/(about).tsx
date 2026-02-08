// @ts-nocheck

import { h } from "preact";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="Jen.js" />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-white via-gray-50 to-blue-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About This Boilerplate
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              A comprehensive starter template for building modern web
              applications with Jen.js, featuring Tailwind CSS, custom styling,
              and production-ready plugins.
            </p>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Jen.js?
                </h2>
                <p className="text-gray-600 mb-4">
                  Jen.js is a modern TypeScript framework built for the next
                  generation of web applications. It combines the best of
                  server-side rendering and static generation with a lightweight
                  client runtime powered by Preact.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    ✓ <strong>Hybrid Rendering:</strong> Choose between SSR,
                    SSG, or hybrid for each route
                  </li>
                  <li>
                    ✓ <strong>TypeScript First:</strong> Full type safety from
                    server to client
                  </li>
                  <li>
                    ✓ <strong>Lightweight:</strong> Preact reduces bundle size
                    significantly
                  </li>
                  <li>
                    ✓ <strong>Developer Experience:</strong> Hot module
                    reloading and fast builds
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What This Boilerplate Includes
                </h2>
                <p className="text-gray-600 mb-4">
                  This boilerplate is pre-configured with everything you need to
                  launch a professional web application:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">🎨 Styling</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Tailwind CSS 3.4</li>
                      <li>• SCSS preprocessing</li>
                      <li>• Custom CSS variables</li>
                      <li>• Pre-built components</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">🔌 Plugins</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Analytics tracking</li>
                      <li>• Theme management</li>
                      <li>• Notifications/Toast</li>
                      <li>• Easy to extend</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">
                      💎 Components
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Responsive Header</li>
                      <li>• Hero sections</li>
                      <li>• Feature grids</li>
                      <li>• Card layouts</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">🔧 Tooling</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• TypeScript 5.7</li>
                      <li>• Hot reload dev server</li>
                      <li>• Production builds</li>
                      <li>• Type checking</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Getting Started
                </h2>
                <p className="text-gray-600 mb-4">
                  To use this boilerplate for your next project:
                </p>
                <ol className="space-y-3 text-gray-600">
                  <li>
                    <strong>1. Copy the boilerplate:</strong> Use this directory
                    as your project template
                  </li>
                  <li>
                    <strong>2. Install dependencies:</strong> Run{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      npm install
                    </code>{" "}
                    or{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      pnpm install
                    </code>
                  </li>
                  <li>
                    <strong>3. Start development:</strong> Run{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      npm run dev
                    </code>
                  </li>
                  <li>
                    <strong>4. Customize:</strong> Replace content in{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">site/</code>{" "}
                    with your own
                  </li>
                  <li>
                    <strong>5. Build for production:</strong> Run{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      npm run build
                    </code>
                  </li>
                </ol>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Project Structure
                </h2>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                  {`boilerplate/
├── site/
│   ├── components/        # Reusable React components
│   ├── plugins/           # Analytics, theme, notifications
│   ├── styles/            # SCSS stylesheets
│   ├── (index).tsx        # Home page
│   └── about.tsx          # About page
├── dist/                  # Built output
├── package.json           # Dependencies
├── jen.config.ts          # Framework configuration
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration`}
                </pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h3>
                <p className="text-blue-800">
                  The plugins in{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    site/plugins/
                  </code>{" "}
                  are designed to be easily customizable and extensible. Feel
                  free to modify them or create new ones for your specific
                  needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to build something amazing?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Start with this boilerplate and launch your project in minutes.
            </p>
            <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              View Documentation
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export function Head() {
  return (
    <>
      <title>About - Jen.js Boilerplate</title>
      <meta
        name="description"
        content="Learn about the Jen.js boilerplate, its features, and how to get started building modern web applications."
      />
    </>
  );
}
