import { VNode } from 'preact';
import { GoogleFont } from '../src/fonts/google';
import type { LoadContext, LoadResult } from '../src/core/data-loader';

const inter = GoogleFont('Inter', {
  weight: [400, 700],
  subsets: ['latin'],
  display: 'swap',
});

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
}

interface BlogPageProps {
  posts: BlogPost[];
  totalCount: number;
}

/**
 * Server-side data loader
 * This runs on the server before the component renders
 */
export async function load(context: LoadContext): Promise<LoadResult> {
  // Simulate fetching blog posts from a database
  // In a real app, this would query your database or CMS
  const posts: BlogPost[] = [
    {
      id: 1,
      title: 'Getting Started with Jen.js',
      excerpt: 'Learn how to build fast web apps with Bun, Vite, and Preact',
      date: '2025-03-20',
      author: 'Alice Johnson',
    },
    {
      id: 2,
      title: 'API Routes in Jen.js',
      excerpt: 'Create backend endpoints without a separate server',
      date: '2025-03-19',
      author: 'Bob Smith',
    },
    {
      id: 3,
      title: 'Building SSR Applications',
      excerpt: 'Server-side rendering for lightning-fast page loads',
      date: '2025-03-18',
      author: 'Charlie Brown',
    },
  ];

  // You can also access query parameters, headers, etc.
  const sortBy = context.query?.sort as string || 'date';

  // Simulate sorting
  if (sortBy === 'title') {
    posts.sort((a, b) => a.title.localeCompare(b.title));
  }

  return {
    props: {
      posts,
      totalCount: posts.length,
    },
    // Optional: revalidate every 1 hour (ISR)
    revalidate: 3600,
  };
}

/**
 * Blog page component
 * Receives data from the load() function as props
 */
export default function BlogPage({ posts, totalCount }: BlogPageProps): VNode {
  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: `${inter.style.fontFamily}, system-ui, sans-serif`,
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem', color: '#00ff00' }}>Blog</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        {totalCount} articles
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
        }}
      >
        {posts.map((post) => (
          <article
            key={post.id}
            style={{
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '1.5rem',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.borderColor = '#00ff00';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.borderColor = '#333';
            }}
          >
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>
              {post.title}
            </h2>
            <p style={{ color: '#aaa', margin: '0.5rem 0', fontSize: '0.9rem' }}>
              {post.excerpt}
            </p>
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #333',
                fontSize: '0.8rem',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
