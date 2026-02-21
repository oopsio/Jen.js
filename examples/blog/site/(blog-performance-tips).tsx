import { h } from "preact";
import { marked } from "marked";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";

const htmlContent = `<h1>Web Performance Tips</h1>
<p>A slow website is a losing website. Here are practical tips to optimize your site&#39;s performance.</p>
<h2>Image Optimization</h2>
<p>Images often account for most of a page&#39;s bytes. Optimize them aggressively.</p>
<pre><code class="language-bash"># Use modern formats
- AVIF (.avif) - Best compression
- WebP (.webp) - Better than JPEG/PNG
- JPEG - For photos
- PNG - For graphics with transparency
</code></pre>
<p><strong>Responsive Images:</strong></p>
<pre><code class="language-html">&lt;img 
  src=&quot;image.jpg&quot; 
  srcset=&quot;small.jpg 480w, medium.jpg 800w, large.jpg 1200w&quot;
  sizes=&quot;(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw&quot;
  alt=&quot;Description&quot;
/&gt;
</code></pre>
<h2>JavaScript Optimization</h2>
<p>Reduce and defer JavaScript loading:</p>
<ul>
<li><strong>Code splitting</strong>: Load only what&#39;s needed</li>
<li><strong>Tree shaking</strong>: Remove unused code</li>
<li><strong>Minification</strong>: Reduce file size</li>
<li><strong>Lazy loading</strong>: Load modules on demand</li>
<li><strong>Service workers</strong>: Cache for offline access</li>
</ul>
<h2>CSS Optimization</h2>
<ul>
<li>Use CSS variables for reusability</li>
<li>Remove unused styles (CSS purging)</li>
<li>Minimize CSS</li>
<li>Use <code>content-visibility</code> for large lists</li>
<li>Avoid layout thrashing</li>
</ul>
<h2>Caching Strategies</h2>
<pre><code>Browser Cache: 1 year for static assets
CDN Cache: 1 hour for HTML
Server Cache: 5-10 minutes for dynamic content
</code></pre>
<h2>Core Web Vitals</h2>
<p>Google&#39;s key metrics for performance:</p>
<ol>
<li><strong>LCP (Largest Contentful Paint)</strong>: &lt; 2.5s</li>
<li><strong>FID (First Input Delay)</strong>: &lt; 100ms</li>
<li><strong>CLS (Cumulative Layout Shift)</strong>: &lt; 0.1</li>
</ol>
<h2>Database Optimization</h2>
<ul>
<li>Use indexes on frequently queried columns</li>
<li>Normalize database schema</li>
<li>Cache query results</li>
<li>Use connection pooling</li>
<li>Monitor slow queries</li>
</ul>
<h2>Monitoring</h2>
<p>Use these tools to measure performance:</p>
<ul>
<li><a href="https://pagespeed.web.dev">Google PageSpeed Insights</a></li>
<li><a href="https://www.webpagetest.org">WebPageTest</a></li>
<li><a href="https://developers.google.com/web/tools/lighthouse">Lighthouse</a></li>
<li><a href="https://gtmetrix.com">GTmetrix</a></li>
</ul>
<h2>Summary</h2>
<p>Performance optimization is a continuous process. Measure, optimize, and monitor regularly. Your users will thank you! 🚀</p>
<p>Remember: <strong>Speed is a feature</strong>, not an afterthought.</p>
`;

export function Head() {
  return (
    <>
      <title>Web Performance Tips - Jen.js Blog</title>
      <meta name="description" content="Practical tips to make your website faster" />
    </>
  );
}

export default function BlogPost() {
  const formattedDate = new Date("Wed Feb 18 2026 05:30:00 GMT+0530 (India Standard Time)").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page blog-post-page">
      <Header />

      <main>
        <article className="blog-post">
          <div className="container">
            <div className="post-header">
              <h1>Web Performance Tips</h1>
              <div className="post-meta">
                <span className="author">By Jordan Martinez</span>
                <time dateTime="Wed Feb 18 2026 05:30:00 GMT+0530 (India Standard Time)">{formattedDate}</time>
              </div>
            </div>

            <div
              className="post-content"
              dangerouslySetInnerHTML={{
                __html: htmlContent,
              }}
            />

            <div className="post-footer">
              <hr />
              <p className="author-bio">
                Written by <strong>Jordan Martinez</strong>
              </p>
              <a href="/blog" className="back-link">← Back to all posts</a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
