import { h } from "preact";
import postsData from "./.generated/posts.json" assert { type: "json" };
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import BlogCard from "./components/BlogCard.js";

const posts = postsData;
const featuredPosts = posts.filter((p: any) => p.featured);
const latestPosts = posts.slice(0, 3);

export function Head() {
  return (
    <>
      <title>Jen.js Blog</title>
      <meta name="description" content="A modern blog built with Jen.js" />
    </>
  );
}

export default function Home() {
  return (
    <div className="page home-page">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>Welcome to Jen.js Blog</h1>
              <p>Discover articles about web development, design, and modern frameworks</p>
              <a href="/blog" className="cta-button">Explore Blog</a>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="featured-section">
            <div className="container">
              <h2>Featured Articles</h2>
              <div className="posts-grid featured-grid">
                {featuredPosts.map((post: any) => (
                  <BlogCard key={post.slug} {...post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest Posts */}
        <section className="latest-section">
          <div className="container">
            <h2>Latest Articles</h2>
            <div className="posts-grid">
              {latestPosts.map((post: any) => (
                <BlogCard key={post.slug} {...post} />
              ))}
            </div>
            {posts.length > 3 && (
              <div className="view-all">
                <a href="/blog" className="link-button">View All Articles →</a>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Built with Jen.js</h2>
            <p>This blog is built with Jen.js, a fast, modern web framework for TypeScript lovers.</p>
            <a href="https://github.com/oopsio/jen.js" target="_blank" rel="noopener" className="cta-button secondary">
              Learn More
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
