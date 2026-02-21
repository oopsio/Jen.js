import { h } from "preact";
import { marked } from "marked";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";

const htmlContent = `<h1>Markdown Guide</h1>
<p>Markdown is a lightweight markup language that&#39;s perfect for writing content. This guide covers all the essentials.</p>
<h2>Text Formatting</h2>
<p>You can make text <strong>bold</strong> using <code>**text**</code> or <em>italic</em> using <code>*text*</code>.</p>
<p>You can also combine them: <em><strong>bold and italic</strong></em>.</p>
<p><del>Strikethrough text</del> uses <code>~~text~~</code>.</p>
<h2>Headings</h2>
<pre><code class="language-markdown"># Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
</code></pre>
<h2>Lists</h2>
<h3>Unordered Lists</h3>
<ul>
<li>Item 1</li>
<li>Item 2<ul>
<li>Nested item</li>
<li>Another nested item</li>
</ul>
</li>
<li>Item 3</li>
</ul>
<h3>Ordered Lists</h3>
<ol>
<li>First item</li>
<li>Second item<ol>
<li>Nested ordered item</li>
<li>Another nested item</li>
</ol>
</li>
<li>Third item</li>
</ol>
<h2>Code</h2>
<p>Inline code uses backticks: <code>const x = 42</code></p>
<p>Code blocks use triple backticks:</p>
<pre><code class="language-typescript">function greet(name: string): string {
  return `Hello, ${name}!`;
}
</code></pre>
<h2>Blockquotes</h2>
<blockquote>
<p>This is a blockquote. It can span multiple lines
and contains important information.</p>
</blockquote>
<h2>Links and Images</h2>
<p><a href="https://example.com">Link text</a></p>
<p><img src="https://via.placeholder.com/150" alt="Alt text"></p>
<h2>Tables</h2>
<table>
<thead>
<tr>
<th>Feature</th>
<th>Jen.js</th>
<th>Next.js</th>
<th>Astro</th>
</tr>
</thead>
<tbody><tr>
<td>Speed</td>
<td>⚡</td>
<td>⚡</td>
<td>⚡</td>
</tr>
<tr>
<td>SSR</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
</tr>
<tr>
<td>Islands</td>
<td>✓</td>
<td>✗</td>
<td>✓</td>
</tr>
</tbody></table>
<h2>Horizontal Rules</h2>
<hr>
<p>Above is a horizontal rule created with <code>---</code></p>
<h2>Escaping</h2>
<p>Use backslash to escape special characters: *not italic*</p>
<h2>Pro Tips</h2>
<ol>
<li>Keep lines under 80 characters for readability</li>
<li>Use consistent heading levels</li>
<li>Add plenty of whitespace for readability</li>
<li>Prefer unordered lists for non-sequential items</li>
<li>Use code blocks for technical content</li>
</ol>
<p>Now you&#39;re ready to write amazing content! ✍️</p>
`;

export function Head() {
  return (
    <>
      <title>Markdown Guide - Jen.js Blog</title>
      <meta name="description" content="Complete guide to writing content in Markdown for your blog" />
    </>
  );
}

export default function BlogPost() {
  const formattedDate = new Date("Fri Feb 20 2026 05:30:00 GMT+0530 (India Standard Time)").toLocaleDateString("en-US", {
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
              <h1>Markdown Guide</h1>
              <div className="post-meta">
                <span className="author">By Sarah Chen</span>
                <time dateTime="Fri Feb 20 2026 05:30:00 GMT+0530 (India Standard Time)">{formattedDate}</time>
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
                Written by <strong>Sarah Chen</strong>
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
