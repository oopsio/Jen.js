import { h } from "preact";

interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  featured?: boolean;
}

export default function BlogCard({ 
  title, 
  excerpt, 
  author, 
  date,
  slug,
  featured = false
}: BlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className={`blog-card ${featured ? "featured" : ""}`}>
      {featured && <span className="featured-badge">Featured</span>}
      <div className="card-content">
        <h3>
          <a href={`/blog/${slug}`}>{title}</a>
        </h3>
        <p className="excerpt">{excerpt}</p>
        <div className="card-meta">
          <span className="author">By {author}</span>
          <span className="date">{formattedDate}</span>
        </div>
        <a href={`/blog/${slug}`} className="read-more">
          Read More →
        </a>
      </div>
    </article>
  );
}
