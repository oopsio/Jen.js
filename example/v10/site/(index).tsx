import type { LoaderContext } from "../../../src/core/types.js";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  views: number;
}

interface HomeData {
  posts: Post[];
  totalPosts: number;
  latestPost: Post;
}

// @ts-ignore

export default function Home({ data }: { data: HomeData }) {
  return (
    <main className="home">
      <header className="hero">
        <h1>Welcome to Our Blog</h1>
        <p className="tagline">Insights, stories, and tutorials</p>
      </header>

      <section className="featured">
        <h2>Latest Post</h2>
        {data.latestPost && (
          <article className="post-card featured">
            <h3>
              <a href={`/blog/${data.latestPost.slug}`}>
                {data.latestPost.title}
              </a>
            </h3>
            <p className="meta">
              By {data.latestPost.author} • {data.latestPost.date} •{" "}
              {data.latestPost.views} views
            </p>
            <p>{data.latestPost.excerpt}</p>
            <a href={`/blog/${data.latestPost.slug}`} className="read-more">
              Read More →
            </a>
          </article>
        )}
      </section>

      <section className="all-posts">
        <h2>All Posts</h2>
        <div className="posts-grid">
          {data.posts.map((post) => (
            <article key={post.id} className="post-card">
              <h3>
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </h3>
              <p className="meta">
                {post.date} • {post.views} views
              </p>
              <p>{post.excerpt}</p>
              <a href={`/blog/${post.slug}`} className="read-more">
                Read →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Subscribe to Updates</h2>
        <p>Get the latest posts delivered to your inbox</p>
        <form className="newsletter-form">
          <input type="email" placeholder="your@email.com" required />
          <button type="submit">Subscribe</button>
        </form>
      </section>
    </main>
  );
}

export function Head({ data }: { data: HomeData }) {
  return (
    <>
      <title>Blog - Insights & Tutorials</title>
      <meta
        name="description"
        content="Read our latest blog posts about web development, design, and technology."
      />
      <meta property="og:title" content="Blog" />
      <meta
        property="og:description"
        content="Read our latest blog posts about web development, design, and technology."
      />
    </>
  );
}

export async function loader(ctx: LoaderContext): Promise<HomeData> {
  // Simulate fetching posts from database
  const posts: Post[] = [
    {
      id: "1",
      slug: "getting-started-with-jen-js",
      title: "Getting Started with Jen.js",
      excerpt: "Learn how to build your first app with Jen.js framework.",
      author: "Sarah Chen",
      date: "2026-01-26",
      views: 1523,
    },
    {
      id: "2",
      slug: "building-production-apps",
      title: "Building Production-Grade Apps",
      excerpt: "Best practices for building scalable applications.",
      author: "Alex Rivera",
      date: "2026-01-25",
      views: 892,
    },
    {
      id: "3",
      slug: "typescript-best-practices",
      title: "TypeScript Best Practices",
      excerpt: "Master TypeScript patterns for better code.",
      author: "Jordan Park",
      date: "2026-01-24",
      views: 654,
    },
  ];

  return {
    posts: posts.slice(1),
    totalPosts: posts.length,
    latestPost: posts[0],
  };
}
