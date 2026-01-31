# Building a Blog with Jen.js

Complete guide to building a production-ready blog.

## Project Setup

```bash
npm create jen-js@latest my-blog
cd my-blog
npm install
```

## File Structure

```
my-blog/
├── site/
│   ├── (home).tsx           # Blog homepage
│   ├── (about).tsx          # About page
│   ├── posts/
│   │   ├── (index).tsx      # Posts list
│   │   └── ($slug).tsx      # Individual post
│   └── api/
│       └── (posts).ts       # Posts API
├── src/
│   ├── components/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── post-card.tsx
│   ├── lib/
│   │   └── posts.ts
│   └── styles/
│       └── globals.css
├── posts/                   # Markdown posts
│   ├── hello-world.md
│   └── getting-started.md
└── public/
    └── images/
```

## Post Data Structure

Posts stored in database or markdown files:

```typescript
interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
}
```

## Database Setup

Create posts table:

```typescript
// src/lib/posts.ts
import { DB } from '@src/db';

let db: DB;

export async function initDB() {
  db = new DB({ type: 'sqlite', config: { filename: './blog.db' } });
  await db.connect();
  
  // Create posts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      author TEXT,
      category TEXT,
      tags TEXT,
      published BOOLEAN DEFAULT FALSE,
      featured BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_published ON posts(published);
  `);
}

export async function getPost(slug: string) {
  const post = await db.findOne('posts', { slug, published: true });
  if (post && post.tags) {
    post.tags = JSON.parse(post.tags);
  }
  return post;
}

export async function getPosts(options = {}) {
  const posts = await db.find('posts', 
    { published: true },
    { sort: { created_at: -1 }, ...options }
  );
  
  return posts.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : []
  }));
}

export async function getFeaturedPosts(limit = 5) {
  return db.find('posts',
    { published: true, featured: true },
    { limit, sort: { created_at: -1 } }
  );
}

export async function getPostsByCategory(category: string) {
  return db.find('posts',
    { published: true, category },
    { sort: { created_at: -1 } }
  );
}

export async function getPostsByTag(tag: string) {
  return db.find('posts',
    { published: true },
    { sort: { created_at: -1 } }
  ).then(posts =>
    posts.filter(p => 
      JSON.parse(p.tags || '[]').includes(tag)
    )
  );
}
```

## Homepage

`site/(home).tsx`

```typescript
import { Header } from '@src/components/header';
import { Footer } from '@src/components/footer';
import { getFeaturedPosts } from '@src/lib/posts';

export async function loader() {
  const featured = await getFeaturedPosts(3);
  return { featured };
}

export default function Home({ data }: any) {
  return (
    <html>
      <head>
        <title>My Blog</title>
        <meta name="description" content="Welcome to my blog" />
      </head>
      <body>
        <Header />
        
        <main>
          <section class="hero">
            <h1>Welcome to My Blog</h1>
            <p>Thoughts on web development and technology</p>
          </section>
          
          <section class="featured">
            <h2>Featured Posts</h2>
            <div class="posts-grid">
              {data.featured.map(post => (
                <article key={post.id}>
                  <h3><a href={`/posts/${post.slug}`}>{post.title}</a></h3>
                  <p>{post.excerpt}</p>
                  <a href={`/posts/${post.slug}`}>Read More</a>
                </article>
              ))}
            </div>
          </section>
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
```

## Posts List

`site/posts/(index).tsx`

```typescript
import { getPosts } from '@src/lib/posts';

export async function loader(ctx) {
  const page = parseInt(ctx.query.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const posts = await getPosts({ limit, offset });
  const total = await db.count('posts', { published: true });
  
  return {
    posts,
    page,
    total,
    pages: Math.ceil(total / limit)
  };
}

export default function PostsList({ data }: any) {
  return (
    <html>
      <head>
        <title>All Posts</title>
      </head>
      <body>
        <h1>Blog Posts</h1>
        
        <div class="posts-list">
          {data.posts.map(post => (
            <article key={post.id} class="post-item">
              <h2><a href={`/posts/${post.slug}`}>{post.title}</a></h2>
              <p class="meta">
                By {post.author} | {new Date(post.created_at).toLocaleDateString()}
              </p>
              <p>{post.excerpt}</p>
              <div class="tags">
                {JSON.parse(post.tags || '[]').map(tag => (
                  <a href={`/posts?tag=${tag}`} class="tag">{tag}</a>
                ))}
              </div>
            </article>
          ))}
        </div>
        
        {/* Pagination */}
        <div class="pagination">
          {data.page > 1 && (
            <a href={`/posts?page=${data.page - 1}`}>Previous</a>
          )}
          
          <span>Page {data.page} of {data.pages}</span>
          
          {data.page < data.pages && (
            <a href={`/posts?page=${data.page + 1}`}>Next</a>
          )}
        </div>
      </body>
    </html>
  );
}
```

## Post Detail

`site/posts/($slug).tsx`

```typescript
import { getPost } from '@src/lib/posts';
import type { LoaderContext } from '@src/core/routes';

export async function staticPaths() {
  const posts = await getPosts({ limit: 1000 });
  return posts.map(p => ({ slug: p.slug }));
}

export async function loader(ctx: LoaderContext) {
  const post = await getPost(ctx.params.slug);
  
  if (!post) {
    ctx.response.writeHead(404);
    ctx.response.end('Not found');
    return {};
  }
  
  return { post };
}

export function Head({ data }: any) {
  return (
    <>
      <title>{data.post.title}</title>
      <meta name="description" content={data.post.excerpt} />
      <meta property="og:title" content={data.post.title} />
      <meta property="og:description" content={data.post.excerpt} />
    </>
  );
}

export default function Post({ data }: any) {
  const post = data.post;
  
  return (
    <html>
      <head>
        <style>
          {`
            article { max-width: 800px; margin: 0 auto; }
            .meta { color: #666; font-size: 0.9em; }
            .tags { margin: 1em 0; }
            .tag { 
              display: inline-block;
              background: #eee;
              padding: 0.25em 0.5em;
              margin-right: 0.5em;
              text-decoration: none;
            }
          `}
        </style>
      </head>
      <body>
        <article>
          <h1>{post.title}</h1>
          
          <div class="meta">
            <p>By {post.author}</p>
            <p>{new Date(post.created_at).toLocaleDateString()}</p>
            {post.category && <p>Category: {post.category}</p>}
          </div>
          
          <div class="tags">
            {JSON.parse(post.tags || '[]').map(tag => (
              <a key={tag} href={`/posts?tag=${tag}`} class="tag">{tag}</a>
            ))}
          </div>
          
          <div class="content">
            {post.content}
          </div>
        </article>
      </body>
    </html>
  );
}

// Enable SSG and cache for 1 day
export const mode = 'ssg';
export const revalidate = 86400;
```

## Posts API

`site/api/(posts).ts`

```typescript
import { getPosts, getPost } from '@src/lib/posts';

export async function handle(req, res) {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  if (req.method === 'GET') {
    const slug = url.searchParams.get('slug');
    
    if (slug) {
      const post = await getPost(slug);
      if (post) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(post));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } else {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = 10;
      const offset = (page - 1) * limit;
      
      const posts = await getPosts({ limit, offset });
      
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(posts));
    }
  }
}
```

## Styling

`src/styles/globals.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fff;
}

main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2em 1em;
}

article {
  margin-bottom: 2em;
  padding-bottom: 2em;
  border-bottom: 1px solid #eee;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.hero {
  text-align: center;
  padding: 4em 1em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3em;
  margin-bottom: 0.5em;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2em;
  margin: 2em 0;
}

.meta {
  color: #666;
  font-size: 0.9em;
  margin: 0.5em 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 1em 0;
}

.tag {
  background: #eee;
  padding: 0.25em 0.75em;
  border-radius: 1em;
  font-size: 0.9em;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin: 2em 0;
}
```

## Production Checklist

- [ ] Set up database with proper indexing
- [ ] Add SEO metadata (title, description, og tags)
- [ ] Implement sitemap generation
- [ ] Add RSS feed
- [ ] Enable caching for posts
- [ ] Set up search functionality
- [ ] Add comments system (optional)
- [ ] Configure analytics
- [ ] Add social sharing buttons
- [ ] Set up email newsletter
- [ ] Optimize images
- [ ] Mobile responsive design
- [ ] Test performance
- [ ] Deploy to production

## Next Steps

1. Add more features (comments, search, etc.)
2. Customize styling
3. Add deployment configuration
4. Set up analytics
5. Create admin interface for posts
