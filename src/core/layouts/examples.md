# Nested Layouts - Usage Examples

## Example 1: Simple Multi-Level Hierarchy

### File Structure

```
src/
├── (layout).tsx           # Root - HTML wrapper
├── (home).tsx             # Home page
├── pages/
│   ├── (layout).tsx       # Pages section layout
│   ├── (about).tsx        # About page
│   └── blog/
│       ├── (layout).tsx   # Blog section layout
│       ├── (list).tsx     # Blog index
│       └── ($slug).tsx    # Individual post
```

### Root Layout

```typescript
// src/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  siteName: "My Awesome Site",
  primaryColor: "#0066cc",
};

export function Head() {
  return (
    <>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0066cc" />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}

export default function RootLayout({ children, data, params, query }) {
  return (
    <html>
      <head>
        <title>My Awesome Site</title>
      </head>
      <body>
        {children}
        <script type="module" src="/main.js"></script>
      </body>
    </html>
  );
}
```

### Pages Layout

```typescript
// src/pages/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  showNavigation: true,
  navClass: "primary-nav",
};

export function Head() {
  return (
    <meta name="robots" content="index, follow" />
  );
}

export default function PagesLayout({ children, data }) {
  return (
    <div class="pages-layout">
      <nav class="primary-nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
      </nav>
      <main>{children}</main>
      <footer>
        <p>&copy; 2024 My Awesome Site</p>
      </footer>
    </div>
  );
}
```

### Blog Layout

```typescript
// src/pages/blog/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  category: "blog",
  showSidebar: true,
  sidebarPosition: "right",
};

export function Head() {
  return (
    <>
      <meta name="description" content="Latest blog posts" />
      <link rel="alternate" type="application/rss+xml" href="/blog/feed.xml" />
    </>
  );
}

export default function BlogLayout({ children, data }) {
  const recentPosts = data?.recentPosts || [];

  return (
    <div class="blog-layout">
      <aside class="blog-sidebar">
        <h3>Recent Posts</h3>
        <ul>
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      </aside>
      <article class="blog-content">
        {children}
      </article>
    </div>
  );
}
```

### Blog Post Page

```typescript
// src/pages/blog/($slug).tsx
import type { RouteModule } from "jenjs";

export const loader = async (ctx) => {
  const { slug } = ctx.params;
  const post = await fetchPost(slug);

  if (!post) {
    throw new Error("Post not found");
  }

  return { post };
};

export function Head({ data }) {
  return (
    <>
      <title>{data.post.title}</title>
      <meta name="description" content={data.post.summary} />
      <meta property="og:title" content={data.post.title} />
      <meta property="og:description" content={data.post.summary} />
    </>
  );
}

export default function Post({ data }) {
  const { post } = data;

  return (
    <article>
      <h1>{post.title}</h1>
      <div class="meta">
        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
        {post.author && <span> by {post.author}</span>}
      </div>
      <div class="content" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
```

### Rendered Output for `/blog/hello-world`

The layout hierarchy creates this composition:

```
RootLayout
  └─ PagesLayout
      └─ BlogLayout
          └─ Post
```

Final HTML structure:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0066cc" />
    <link rel="icon" href="/favicon.ico" />

    <meta name="robots" content="index, follow" />

    <meta name="description" content="Latest blog posts" />
    <link rel="alternate" type="application/rss+xml" href="/blog/feed.xml" />

    <title>Hello World</title>
    <meta name="description" content="My first post" />
    <meta property="og:title" content="Hello World" />
    <meta property="og:description" content="My first post" />
  </head>
  <body>
    <nav class="primary-nav">
      <a href="/">Home</a>
      <!-- ... -->
    </nav>
    <main>
      <div class="blog-layout">
        <aside class="blog-sidebar">
          <h3>Recent Posts</h3>
          <ul>
            <!-- recent posts -->
          </ul>
        </aside>
        <article class="blog-content">
          <article>
            <h1>Hello World</h1>
            <div class="meta">
              <!-- post metadata -->
            </div>
            <div class="content">
              <!-- post HTML content -->
            </div>
          </article>
        </article>
      </div>
    </main>
    <footer>
      <p>&copy; 2024 My Awesome Site</p>
    </footer>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

## Example 2: Admin Panel with Authentication

### File Structure

```
src/
├── (layout).tsx
├── admin/
│   ├── (layout).tsx       # Auth & role checks
│   ├── (dashboard).tsx
│   └── users/
│       ├── (layout).tsx   # Users management layout
│       ├── (list).tsx
│       └── ($id).tsx
```

### Admin Root Layout

```typescript
// src/admin/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  requiresAuth: true,
  minimumRole: "admin",
  showAdminNav: true,
};

export default function AdminLayout({ children, data }) {
  // data.user set by middleware
  const user = data?.user;

  if (!user) {
    return (
      <div class="error">
        <h1>Unauthorized</h1>
        <p>Please log in to access the admin panel.</p>
        <a href="/login">Log In</a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div class="error">
        <h1>Access Denied</h1>
        <p>You do not have permission to access this area.</p>
      </div>
    );
  }

  return (
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <a href="/admin">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/settings">Settings</a>
        </nav>
        <div class="user-info">
          <p>Logged in as: {user.name}</p>
          <a href="/logout">Log Out</a>
        </div>
      </aside>
      <main class="admin-content">
        {children}
      </main>
    </div>
  );
}
```

### Users Section Layout

```typescript
// src/admin/users/(layout).tsx
import type { LayoutModule } from "jenjs";

export const layout: LayoutModule["layout"] = {
  section: "users",
  pageSize: 20,
};

export default function UsersLayout({ children, data }) {
  const totalUsers = data?.totalUsers || 0;

  return (
    <div class="users-section">
      <div class="section-header">
        <h1>Users Management</h1>
        <div class="stats">
          <span>Total Users: {totalUsers}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
```

### Users List Page

```typescript
// src/admin/users/(list).tsx
import type { RouteModule } from "jenjs";

export const loader = async (ctx) => {
  const page = parseInt(ctx.query.page) || 1;
  const users = await fetchUsers({ page, limit: 20 });
  const total = await countUsers();

  return { users, total, page };
};

export default function UsersList({ data }) {
  const { users, total, page } = data;

  return (
    <div class="users-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                <a href={`/admin/users/${user.id}`}>Edit</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div class="pagination">
        {page > 1 && <a href={`?page=${page - 1}`}>← Previous</a>}
        <span>Page {page}</span>
        {page * 20 < total && <a href={`?page=${page + 1}`}>Next →</a>}
      </div>
    </div>
  );
}
```

## Example 3: Configuration Cascade & Override

```typescript
// src/(layout).tsx - Root
export const layout = {
  theme: "light",
  fontSize: "16px",
  spacing: "1rem",
  sidebar: true,
};

// src/docs/(layout).tsx - Override
export const layout = {
  sidebar: true,  // same as parent
  fontSize: "14px", // override
  // spacing and theme inherited
};

// src/docs/api/(layout).tsx - Further override
export const layout = {
  spacing: "0.75rem", // override
  // sidebar, fontSize, theme inherited
};

// Merged config for /docs/api/page:
{
  theme: "light",      // from root
  fontSize: "14px",    // from docs
  spacing: "0.75rem",  // from docs/api
  sidebar: true,       // from root/docs/api
}
```

Access via route loader:

```typescript
export const loader = async (ctx) => {
  // ctx doesn't include layout config by default
  // Pass from layout via middleware if needed
  return { myData: "value" };
};
```

Or pass to page via layout:

```typescript
// src/docs/api/(layout).tsx
export default function ApiLayout({ children, data }) {
  return (
    <div data-spacing="0.75rem" data-font-size="14px">
      {children}
    </div>
  );
}
```
