import { h } from "preact";
import postsData from "./.generated/posts.json" assert { type: "json" };
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import BlogCard from "./components/BlogCard.js";

const posts = postsData;

export function Head() {
  return (
    <>
      <title>Blog - Jen.js</title>
      <meta name="description" content={`${posts.length} articles about Jen.js and web development`} />
    </>
  );
}

export default function BlogIndex() {
  return (
    <div className="page blog-page">
      <Header />

      <main>
        {/* Blog Header */}
        <section className="page-header">
          <div className="container">
            <h1>Blog</h1>
            <p>Articles about web development, design, and the Jen.js framework</p>
          </div>
        </section>

        {/* All Posts */}
        <section className="posts-section">
          <div className="container">
            <div className="posts-grid">
              {posts.length > 0 ? (
                posts.map((post: any) => (
                  <BlogCard key={post.slug} {...post} />
                ))
              ) : (
                <div className="no-posts">
                  <p>No articles yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
