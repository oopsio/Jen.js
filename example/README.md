# Jen.js Production Examples

Complete, production-grade example applications built with Jen.js.

## Examples Included

### 1. **Blog Application**
- Multi-page blog with posts
- Dynamic routing with slugs
- Server-side data loading
- Full-text search
- Real-world database patterns

### 2. **E-Commerce Store**
- Product listing
- Product detail pages
- Shopping cart API
- Order management
- Inventory tracking

### 3. **SaaS Dashboard**
- User authentication
- Dashboard statistics
- Data visualization
- Settings page
- API integration

### 4. **Documentation Site**
- Nested route structure
- Table of contents generation
- Code syntax highlighting
- Search functionality
- Version management

## Quick Start

```bash
# Use example as template
cp -r example/blog my-blog

# Install
cd my-blog
npm install

# Build
npm run build

# Deploy
npm run bundle
```

## File Structure

```
example/
├── blog/                    # Blog example
│   ├── site/
│   │   ├── (index).tsx      # Blog home
│   │   ├── (about).tsx      # About page
│   │   ├── blog/
│   │   │   ├── (index).tsx  # Blog list
│   │   │   └── ($slug).tsx  # Blog post
│   │   ├── api/
│   │   │   ├── (posts).ts   # Posts API
│   │   │   └── (search).ts  # Search API
│   │   ├── styles/
│   │   │   └── global.scss
│   │   └── assets/
│   ├── jen.config.ts
│   └── package.json
│
├── ecommerce/               # E-commerce example
│   ├── site/
│   │   ├── (index).tsx      # Homepage
│   │   ├── shop/
│   │   │   ├── (index).tsx  # Products
│   │   │   └── ($id).tsx    # Product detail
│   │   ├── cart/
│   │   │   └── (index).tsx  # Shopping cart
│   │   ├── api/
│   │   │   ├── (products).ts
│   │   │   ├── (cart).ts
│   │   │   └── (orders).ts
│   │   └── styles/
│   ├── jen.config.ts
│   └── package.json
│
├── saas-dashboard/          # SaaS example
│   ├── site/
│   │   ├── auth/
│   │   │   ├── (login).tsx
│   │   │   └── (register).tsx
│   │   ├── dashboard/
│   │   │   ├── (index).tsx
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── (auth).ts
│   │   │   ├── (users).ts
│   │   │   └── (stats).ts
│   │   └── styles/
│   ├── jen.config.ts
│   └── package.json
│
└── docs/                    # Documentation site
    ├── site/
    │   ├── (index).tsx
    │   ├── docs/
    │   │   ├── ($version).tsx
    │   │   └── ($version)/
    │   │       ├── (index).tsx
    │   │       └── ($page).tsx
    │   ├── api/
    │   │   ├── (search).ts
    │   │   └── (versions).ts
    │   └── styles/
    ├── jen.config.ts
    └── package.json
```

## Running Examples

### Blog
```bash
cd example/blog
npm install
npm run build
```

### E-Commerce
```bash
cd example/ecommerce
npm install
npm run build
```

### SaaS Dashboard
```bash
cd example/saas-dashboard
npm install
npm run build
```

### Documentation
```bash
cd example/docs
npm install
npm run build
```

## Example Patterns Used

### ✅ File-Based Routing
- Homepage routes
- Nested routes
- Dynamic parameters
- Catch-all routes

### ✅ Server-Side Data Loading
- Data fetching in `loader()`
- Type-safe data passing
- Error handling

### ✅ API Endpoints
- REST endpoints
- HTTP methods (GET/POST/DELETE)
- JSON responses
- Error handling

### ✅ Component Patterns
- Layout components
- Reusable components
- Type-safe props

### ✅ Styling
- Global styles
- Component styles
- SCSS/CSS modules
- Responsive design

### ✅ Database Integration
- Multiple database examples
- ORM patterns
- Migration patterns
- Query patterns

## Production Checklist

Each example includes:

- ✅ TypeScript strict mode
- ✅ Error handling
- ✅ Environment configuration
- ✅ Build optimization
- ✅ Security best practices
- ✅ Performance optimization
- ✅ SEO metadata
- ✅ Accessibility features

## Deployment Examples

Each example includes deployment instructions for:

- ✅ Docker
- ✅ Vercel
- ✅ Netlify
- ✅ AWS Lambda
- ✅ npm package

## Learning Path

1. **Start with**: Blog (simplest, great for learning)
2. **Then try**: E-commerce (more complex, real-world)
3. **Then explore**: SaaS Dashboard (advanced patterns)
4. **Finally**: Documentation (advanced routing)

## Features Demonstrated

### Blog
- Static page generation
- Dynamic routes
- Data loading
- Search/filter
- Markdown rendering

### E-Commerce
- Product management
- Shopping cart
- Order processing
- Inventory tracking
- Payment integration stub

### SaaS Dashboard
- User authentication
- Protected routes
- Data visualization
- Real-time updates
- Settings management

### Documentation
- Nested documentation
- Version management
- Full-text search
- Code highlighting
- TOC generation

## Notes

All examples are:
- ✅ Production-ready
- ✅ Fully typed (TypeScript)
- ✅ Best practices implemented
- ✅ Extensively documented
- ✅ Easy to customize
- ✅ Ready to deploy

---

**Choose an example and start building! 🚀**
