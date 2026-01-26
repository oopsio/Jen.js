# Getting Started with Examples

## 🚀 Quick Start

### 1. Use the Blog Example

```bash
# Copy example to your project
cp -r example/blog my-blog

# Enter directory
cd my-blog

# Install dependencies
npm install

# Build
npm run build

# View output
open dist/index/index.html
```

### 2. Explore the Code

Start with these files in order:

1. **site/(index).tsx** - Homepage with featured posts
2. **site/blog/(index).tsx** - Blog listing with pagination
3. **site/blog/($slug).tsx** - Individual blog post page
4. **site/api/(posts).ts** - REST API for posts
5. **site/api/(search).ts** - Search functionality

### 3. Customize

Edit files to add your own content:

- **site/(index).tsx** - Change homepage content
- **site/(about).tsx** - Edit about page
- **site/blog/($slug).tsx** - Update post template
- **site/styles/global.scss** - Customize design

---

## 📚 Learning Order

### Beginner
1. Look at homepage: `site/(index).tsx`
2. Learn loader function usage
3. Understand data passing to components

### Intermediate
1. Study dynamic route: `site/blog/($slug).tsx`
2. Learn parameter access: `ctx.params`
3. Understand post loading pattern

### Advanced
1. Explore API endpoints: `site/api/`
2. Learn REST patterns
3. Study error handling
4. Review pagination logic

---

## 🔍 Key Files Explained

### site/(index).tsx
**What it does**: Renders homepage with featured posts

**Key concepts**:
- Uses `loader()` to fetch data
- Uses `Head()` for SEO
- Maps over data in render
- Responsive grid layout

**Copy this pattern for**: Any page that loads server-side data

### site/blog/($slug).tsx
**What it does**: Renders individual blog post

**Key concepts**:
- Dynamic `$slug` parameter
- Access params via `ctx.params.slug`
- Conditional rendering
- Related posts display

**Copy this pattern for**: Any detail page

### site/api/(posts).ts
**What it does**: REST API for managing posts

**Key concepts**:
- Handle different HTTP methods
- JSON responses
- Error handling
- Query parameters

**Copy this pattern for**: Any API endpoint

---

## 💡 Common Modifications

### Change Homepage Title
**File**: `site/(index).tsx`
```typescript
<h1>Your Blog Title Here</h1>
<p className="tagline">Your tagline</p>
```

### Add New Blog Post
Add to the posts array in any loader function:
```typescript
const posts: Post[] = [
  {
    id: "4",
    slug: "my-new-post",
    title: "My New Post",
    excerpt: "Post description",
    author: "Your Name",
    date: "2026-01-27",
    views: 0,
    category: "Tutorial"
  },
  // ... other posts
];
```

### Change Styling
**File**: `site/styles/global.scss`
- Edit CSS variables at top
- Update colors, spacing, fonts
- Add new component styles

### Add New Page
Create new file: `site/(page-name).tsx`
```typescript
export default function PageName() {
  return <main>...</main>;
}
```

### Add New API Endpoint
Create new file: `site/api/(endpoint-name).ts`
```typescript
export async function handle(req, res) {
  if (req.method === "GET") {
    res.end(JSON.stringify({ data: [] }));
  }
}
```

---

## ✅ Production Checklist

Before deploying your modified example:

- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Review error handling in API routes
- [ ] Test pagination works correctly
- [ ] Check responsive design on mobile
- [ ] Update metadata in Head components
- [ ] Review security (CORS, input validation)
- [ ] Test all routes work
- [ ] Bundle for distribution (`npm run bundle`)

---

## 🆘 Troubleshooting

### Routes not appearing
- Check filename matches `(name).tsx` pattern
- Verify file is in `site/` directory
- Rebuild with `npm run build`

### Dynamic routes not working
- Ensure filename has `($param)` format
- Check param name in loader matches filename
- Verify URL structure in links

### API returning 404
- Check endpoint filename: `site/api/(name).ts`
- Verify HTTP method handled (GET/POST/etc)
- Check Content-Type header set

### Data not loading
- Verify loader function returns data
- Check component receives data prop
- Use `console.log` to debug

### Styles not applying
- Check SCSS syntax is correct
- Verify class names match
- Check responsive breakpoints

---

## 📖 Examples Structure

```
example/
├── blog/                    ← Start here!
│   ├── site/
│   │   ├── (index).tsx
│   │   ├── (about).tsx
│   │   ├── blog/
│   │   │   ├── (index).tsx
│   │   │   └── ($slug).tsx
│   │   ├── api/
│   │   │   ├── (posts).ts
│   │   │   └── (search).ts
│   │   └── styles/
│   │       └── global.scss
│   ├── jen.config.ts
│   ├── package.json
│   └── EXAMPLE_FEATURES.md
│
├── ecommerce/              ← More complex
├── saas-dashboard/         ← Advanced patterns
└── docs/                   ← Complex routing
```

---

## 🎯 Next Steps

1. **Copy example**: `cp -r example/blog my-blog`
2. **Install**: `cd my-blog && npm install`
3. **Explore**: Read the key files listed above
4. **Modify**: Change homepage, add posts
5. **Build**: `npm run build`
6. **Deploy**: `npm run bundle` then upload `build/`

---

## 📚 Learn More

- `example/blog/EXAMPLE_FEATURES.md` - Detailed feature explanations
- `../CREATE_APP.md` - Complete framework guide
- `../TUTORIAL.md` - Step-by-step tutorial

---

**Start with the blog example - it's production-ready and easy to customize! 🚀**
