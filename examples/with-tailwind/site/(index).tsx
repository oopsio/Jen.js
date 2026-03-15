import { h } from "preact";
import Header from "./components/Header.tsx";
import Hero from "./components/Hero.tsx";
import FeatureGrid from "./components/FeatureGrid.tsx";
import Footer from "./components/Footer.tsx";

const features = [
  {
    icon: "",
    title: "Lightning Fast",
    description:
      "Built on modern JavaScript with optimized SSR and static generation for instant load times.",
  },
  {
    icon: "",
    title: "Beautiful UI",
    description:
      "Tailwind CSS pre-configured with custom components and responsive design built-in.",
  },
  {
    icon: "",
    title: "Plugin System",
    description:
      "Extensible architecture with analytics, theme management, and notifications out of the box.",
  },
  {
    icon: "",
    title: "Responsive",
    description:
      "Mobile-first design approach ensuring your app works perfectly on any device.",
  },
  {
    icon: "",
    title: "Type Safe",
    description:
      "Full TypeScript support with strict mode enabled for maximum development confidence.",
  },
  {
    icon: "",
    title: "Production Ready",
    description:
      "Complete with build optimization, asset hashing, and performance monitoring.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        title="Jen.js"
        description="Modern web applications built with TypeScript and Preact"
      />

      <main className="flex-grow">
        <Hero
          title="Build Amazing Web Apps"
          subtitle="A powerful, modern TypeScript framework for server-rendered and static web applications with Preact."
          ctaText="Start Building"
        />

        <FeatureGrid features={features} />

        <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              This boilerplate comes fully configured with Tailwind CSS, custom
              plugins, and everything you need to launch your next project.
            </p>
            <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Create Your Project
            </button>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What's Included
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                   Pre-configured Stack
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li> Tailwind CSS with custom utilities</li>
                  <li> TypeScript with strict mode</li>
                  <li> Preact for lightweight rendering</li>
                  <li> Server-side rendering (SSR)</li>
                  <li> Static site generation (SSG)</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                   Built-in Plugins
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li> Analytics tracking</li>
                  <li> Theme management (light/dark)</li>
                  <li> Toast notifications</li>
                  <li> Session management</li>
                  <li> Easy extensibility</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                   Premium Components
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li> Responsive header & navigation</li>
                  <li> Hero sections</li>
                  <li> Feature grids</li>
                  <li> Card layouts</li>
                  <li> Footer with links</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                   Custom Styling
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li> SCSS preprocessor</li>
                  <li> CSS variables for theming</li>
                  <li> Smooth animations</li>
                  <li> Accessibility utilities</li>
                  <li> Mobile-first approach</li>
                </ul>
              </div>
            </div>
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
      <title>Jen.js Boilerplate - Build Amazing Web Apps</title>
      <meta
        name="description"
        content="A full-featured boilerplate for Jen.js with Tailwind CSS, custom styling, plugins, and modern TypeScript development."
      />
      <meta
        name="keywords"
        content="Jen.js, TypeScript, Preact, SSR, SSG, Web Framework"
      />
      <meta property="og:title" content="Jen.js Boilerplate" />
      <meta
        property="og:description"
        content="Everything you need to build modern web applications"
      />
      <meta property="og:type" content="website" />
    </>
  );
}
