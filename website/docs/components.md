---
sidebar_position: 6
---

# Components & Data Loading

Build interactive pages with Preact components and load data with loader functions.

## Creating Components

Jen.js uses Preact (3KB) instead of React. Preact is 100% JSX compatible.

### Simple Component

```typescript
// site/(home).tsx

export default function Home() {
  return (
    <div className="home">
      <h1>Welcome</h1>
      <p>This is your homepage.</p>
    </div>
  );
}
```

### Component with State

Use Preact hooks:

```typescript
// site/(counter).tsx

import { useState } from 'preact/hooks';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Reusable Components

Create shared components in `site/components/`:

```typescript
// site/components/Button.tsx

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className="btn">
      {label}
    </button>
  );
}
```

Use in routes:

```typescript
// site/(home).tsx

import Button from './components/Button.tsx';

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Button label="Click me" onClick={() => alert('Clicked!')} />
    </div>
  );
}
```

## Data Loading

Load data before rendering with the `loader` function.

### Basic Loader

```typescript
// site/(about).tsx

import type { LoaderContext } from '@src/core/types';

interface AboutData {
  title: string;
  content: string;
  author: string;
}

export async function loader(ctx: LoaderContext): Promise<AboutData> {
  return {
    title: 'About Us',
    content: 'We are a great company...',
    author: 'John Doe'
  };
}

export default function About({ data }: { data: AboutData }) {
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
      <p>By {data.author}</p>
    </article>
  );
}
```

The `data` prop contains what your loader returns.

### Database Queries

Fetch data from your database:

```typescript
// site/posts/($id).tsx

import { DB } from '@src/db';
import type { LoaderContext } from '@src/core/types';

export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  // Query database
  const db = new DB();
  const post = await db.query('posts', { id: parseInt(id) });
  
  if (!post) {
    return { notFound: true };  // 404 page
  }
  
  return post;
}

export default function Post({ data }: any) {
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  );
}
```

### API Calls

Fetch from external APIs:

```typescript
// site/(news).tsx

export async function loader(ctx: LoaderContext) {
  const res = await fetch('https://api.example.com/news');
  const news = await res.json();
  
  return { news };
}

export default function News({ data }: any) {
  return (
    <div>
      <h1>Latest News</h1>
      <ul>
        {data.news.map((item: any) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Query Parameters

Access URL query strings:

```typescript
// site/(search).tsx

export async function loader(ctx: LoaderContext) {
  const { q } = ctx.query;
  
  if (!q) {
    return { results: [] };
  }
  
  const results = await searchDatabase(q);
  return { results };
}

export default function Search({ data }: any) {
  return (
    <div>
      <h1>Search Results</h1>
      <ul>
        {data.results.map((result: any) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

Visit `/search?q=typescript` to search.

## Dynamic Routes

Pass params to your component:

```typescript
// site/users/($username).tsx

export async function loader(ctx: LoaderContext) {
  const { username } = ctx.params;
  
  const user = await fetchUser(username);
  
  return { user };
}

export default function User({ data }: any) {
  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>@{data.user.username}</p>
      <p>{data.user.bio}</p>
    </div>
  );
}
```

Visit `/users/alice` to see Alice's profile.

## Head Management

Set custom head tags per page:

```typescript
// site/(about).tsx

export function Head({ data }: any) {
  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <meta property="og:title" content={data.title} />
      <meta property="og:image" content={data.image} />
    </>
  );
}

export async function loader(ctx: LoaderContext) {
  return {
    title: 'About Us',
    description: 'Learn about our company',
    image: 'https://example.com/og-image.jpg'
  };
}

export default function About({ data }: any) {
  return <h1>{data.title}</h1>;
}
```

## Error Handling

Handle errors gracefully:

```typescript
// site/posts/($id).tsx

export async function loader(ctx: LoaderContext) {
  const { id } = ctx.params;
  
  try {
    const post = await fetchPost(id);
    
    if (!post) {
      return { notFound: true };
    }
    
    return post;
  } catch (error) {
    console.error('Failed to load post:', error);
    return { error: 'Failed to load post' };
  }
}

export default function Post({ data }: any) {
  if (data.notFound) {
    return <h1>Post not found</h1>;
  }
  
  if (data.error) {
    return <h1>Error: {data.error}</h1>;
  }
  
  return <h1>{data.title}</h1>;
}
```

## Conditional Rendering

Show content based on state:

```typescript
// site/(dashboard).tsx

import { useState, useEffect } from 'preact/hooks';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Render data */}
    </div>
  );
}
```

## Styling Components

Use CSS classes with any framework:

```typescript
// site/(home).tsx

import styles from './home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome</h1>
    </div>
  );
}
```

Or inline styles:

```typescript
export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome</h1>
    </div>
  );
}
```

Or Tailwind:

```typescript
export default function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold">Welcome</h1>
    </div>
  );
}
```

## Forms

Handle form submissions:

```typescript
// site/(contact).tsx

import { useState } from 'preact/hooks';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      setSubmitted(true);
    }
  };
  
  if (submitted) {
    return <p>Thank you for contacting us!</p>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required></textarea>
      <button type="submit">Send</button>
    </form>
  );
}
```

## Hooks

Preact supports all the common hooks:

- `useState` - Manage state
- `useEffect` - Run side effects
- `useCallback` - Memoize functions
- `useRef` - Store mutable values
- `useMemo` - Memoize values
- `useReducer` - Complex state management
- `useContext` - Access context

```typescript
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
  useContext
} from 'preact/hooks';
```

## Performance Tips

1. **Use `useMemo` for expensive calculations:**

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

2. **Use `useCallback` for stable function references:**

```typescript
const handleClick = useCallback(() => {
  doSomething();
}, []);
```

3. **Lazy load components:**

```typescript
const HeavyComponent = lazy(() => import('./Heavy.tsx'));

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

4. **Cache loader data when possible:**

```typescript
export const renderConfig = {
  cache: { ttl: 3600 }  // Cache for 1 hour
};
```

## Next Steps

- [API Routes](./api) - Build REST endpoints
- [Database](./database) - Store and query data
- [Authentication](./auth) - Secure your site
