import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen px-4 py-16 md:py-24 gap-16 items-center">
      
      {/* Hero Section */}
      <div className="flex flex-col justify-center text-center gap-6 max-w-3xl w-full mt-8">
        <div className="inline-flex items-center justify-center rounded-full border border-fd-border bg-fd-accent px-4 py-1.5 text-sm font-medium text-fd-muted-foreground self-center">
          <span className="w-2 h-2 rounded-full bg-fd-primary mr-2"></span>
          The next generation web framework
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          Jen.js
        </h1>
        
        <p className="text-fd-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          The high-performance web framework built on{' '}
          <strong>Bun&nbsp;+&nbsp;Vite&nbsp;+&nbsp;Preact&nbsp;+&nbsp;Rust</strong>.
          Streaming SSR, ISR, file-based routing, and edge deployment — all
          in a 3&nbsp;kB client runtime.
        </p>
        
        <div className="flex flex-row justify-center gap-4 mt-4">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-full bg-fd-primary px-7 py-3.5 text-sm font-semibold text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/oopsio/jen.js"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-fd-border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Terminal / Quick Install Box */}
      <div className="w-full max-w-2xl border border-fd-border rounded-xl p-5 bg-fd-accent/50 flex flex-col sm:flex-row items-center justify-between font-mono text-sm shadow-sm gap-4">
        <span className="text-fd-muted-foreground font-semibold">npm create jen-app@latest</span>
        <span className="text-fd-muted-foreground border border-fd-border bg-fd-background px-3 py-1.5 rounded-md text-xs font-sans uppercase tracking-wider">
          Copy Command
        </span>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-4">
        
        <div className="flex flex-col gap-3 p-8 rounded-2xl border border-fd-border bg-fd-background hover:border-fd-primary/50 transition-colors shadow-sm">
          <h3 className="font-bold text-xl">Blazing Fast</h3>
          <p className="text-fd-muted-foreground text-sm leading-relaxed">
            Powered by the Bun runtime and Rust tooling for instant builds, ultra-fast routing, and lightning-quick hot module replacement.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-8 rounded-2xl border border-fd-border bg-fd-background hover:border-fd-primary/50 transition-colors shadow-sm">
          <h3 className="font-bold text-xl">Micro Client</h3>
          <p className="text-fd-muted-foreground text-sm leading-relaxed">
            Ships only 3 kB of JavaScript to the browser by default. Your users get interactive pages immediately without the heavy bloat.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-8 rounded-2xl border border-fd-border bg-fd-background hover:border-fd-primary/50 transition-colors shadow-sm">
          <h3 className="font-bold text-xl">Edge Ready</h3>
          <p className="text-fd-muted-foreground text-sm leading-relaxed">
            Deploy your app globally with zero configuration. Native support for Edge runtimes with Streaming Server-Side Rendering out of the box.
          </p>
        </div>

      </div>
    </div>
  );
}