import { h } from "preact";
import { marked } from "marked";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";

const htmlContent = `<h1>Web Design Principles</h1>
<p>Good design is invisible. It solves problems without drawing attention to itself.</p>
<h2>1. Clarity</h2>
<p>Your website should communicate its purpose immediately. Users shouldn&#39;t have to guess what your site does or how to navigate it.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Use clear, descriptive headings</li>
<li>Keep navigation simple and intuitive</li>
<li>Minimize distractions</li>
</ul>
<h2>2. Consistency</h2>
<p>Consistency builds trust and predictability. Keep your design patterns, colors, and typography consistent throughout your site.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Use a consistent color palette</li>
<li>Maintain uniform spacing and alignment</li>
<li>Use the same fonts throughout</li>
<li>Consistent button styles and interactions</li>
</ul>
<h2>3. Visual Hierarchy</h2>
<p>Guide users&#39; eyes to the most important content first. Use size, color, and positioning to establish hierarchy.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Make important elements larger or bolder</li>
<li>Use contrast to highlight key information</li>
<li>Group related content together</li>
<li>Create clear focal points</li>
</ul>
<h2>4. Whitespace</h2>
<p>Empty space isn&#39;t wasted space. Whitespace improves readability and gives the design room to breathe.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Don&#39;t fear empty space</li>
<li>Use margins and padding generously</li>
<li>Reduce visual clutter</li>
<li>Improve focus on important elements</li>
</ul>
<h2>5. Responsiveness</h2>
<p>Your site must work on all devices. Mobile-first design ensures accessibility for everyone.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Test on multiple devices</li>
<li>Use flexible layouts</li>
<li>Optimize images for different sizes</li>
<li>Ensure touch-friendly interfaces</li>
</ul>
<h2>6. Accessibility</h2>
<p>Design for everyone, including people with disabilities. Accessible design benefits all users.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Use sufficient color contrast</li>
<li>Provide alt text for images</li>
<li>Ensure keyboard navigation</li>
<li>Use semantic HTML</li>
<li>Test with assistive technologies</li>
</ul>
<h2>7. Performance</h2>
<p>Fast websites are better websites. Users expect pages to load quickly.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Optimize images</li>
<li>Minimize CSS and JavaScript</li>
<li>Use caching strategies</li>
<li>Lazy load non-critical content</li>
</ul>
<h2>8. User Testing</h2>
<p>The best way to know if your design works is to test it with real users. Gather feedback and iterate.</p>
<p><strong>Tips:</strong></p>
<ul>
<li>Conduct usability testing</li>
<li>Analyze user behavior</li>
<li>Iterate based on feedback</li>
<li>Monitor analytics</li>
</ul>
<h2>Conclusion</h2>
<p>Great design requires attention to detail and a deep understanding of your users. Follow these principles, test constantly, and always prioritize the user experience.</p>
<p>Remember: <strong>Form follows function</strong>. ✨</p>
`;

export function Head() {
  return (
    <>
      <title>Web Design Principles - Jen.js Blog</title>
      <meta name="description" content="Key principles for creating beautiful, user-friendly websites" />
    </>
  );
}

export default function BlogPost() {
  const formattedDate = new Date("Thu Feb 19 2026 05:30:00 GMT+0530 (India Standard Time)").toLocaleDateString("en-US", {
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
              <h1>Web Design Principles</h1>
              <div className="post-meta">
                <span className="author">By Alex Rivera</span>
                <time dateTime="Thu Feb 19 2026 05:30:00 GMT+0530 (India Standard Time)">{formattedDate}</time>
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
                Written by <strong>Alex Rivera</strong>
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
