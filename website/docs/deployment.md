---
sidebar_position: 15
---

# Deployment

Deploy your Jen.js site to production.

## Pre-Deployment

### 1. Build Your Site

```bash
npm run clean
npm run build
```

Verify successful build:

```bash
ls dist/
# Should contain: index.html, assets/, api/ (if SSR), etc.
```

### 2. Type Check

```bash
npm run typecheck
```

Fix any TypeScript errors.

### 3. Test Locally

For SSG (static):

```bash
npm run build
npm run serve dist/
```

For SSR (dynamic):

```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to verify.

## Deployment Targets

### Static Hosting (SSG)

Perfect for static site generation. Copy `dist/` contents.

#### Vercel

1. Connect repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`

Or deploy via CLI:

```bash
npm install -g vercel
npm run build
vercel deploy --prod dist/
```

#### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

Or deploy via CLI:

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir dist/
```

#### GitHub Pages

Build and push to `gh-pages` branch:

```bash
npm run build
git add dist/
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

#### AWS S3 + CloudFront

```bash
npm run build

# Upload to S3
aws s3 sync dist/ s3://my-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/*"
```

#### Cloudflare Pages

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist/
```

### Server Hosting (SSR)

For server-side rendering with dynamic routes.

#### Node.js Server

Build and run on any Node.js server:

```bash
npm run build
npm run start
```

Environment variables:

```bash
export PORT=3000
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
npm run start
```

#### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t jen-app .
docker run -p 3000:3000 jen-app
```

#### Railway

```bash
npm install -g railway
railway login
railway init
npm run build
railway up
```

#### Render

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`

#### Heroku

```bash
npm install -g heroku
heroku login
heroku create my-app
git push heroku main
```

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set run command: `npm start`
4. Configure environment variables

#### Fly.io

Create `fly.toml`:

```toml
[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = 3000
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

[checks]
  [checks.alive]
    type = "http"
    interval = "10s"
    grace_period = "5s"
    method = "get"
    path = "/"
```

Deploy:

```bash
npm install -g @fly/cli
fly deploy
```

## Environment Configuration

### Development

```bash
NODE_ENV=development
DEBUG=true
DATABASE_URL=sqlite:data/dev.db
```

### Staging

```bash
NODE_ENV=staging
DEBUG=false
DATABASE_URL=postgresql://staging-db...
API_BASE_URL=https://staging-api.example.com
```

### Production

```bash
NODE_ENV=production
DEBUG=false
DATABASE_URL=postgresql://prod-db...
API_BASE_URL=https://api.example.com
```

## Database Migrations

Run migrations before deploying:

```bash
npm run migrate
npm run build
npm run start
```

Or in deployment script:

```bash
#!/bin/bash
npm install
npm run migrate
npm run build
npm run start
```

## Secrets Management

### Environment Variables

Store secrets in `.env` (local development only):

```
API_KEY=secret123
JWT_SECRET=your-secret-key
DATABASE_PASSWORD=password123
```

Never commit `.env` to git.

### Production Secrets

Use platform-specific secret management:

**Vercel:**
```bash
vercel env add API_KEY
```

**Netlify:**
```bash
netlify env:set API_KEY "secret123"
```

**Docker:**
```bash
docker run -e API_KEY=secret123 jen-app
```

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret --name jen-app-secrets
```

## Health Checks

Implement health check endpoint:

```typescript
// site/api/health.ts

export async function handle(req: IncomingMessage, res: ServerResponse) {
  try {
    // Check database connection
    const db = new DB();
    await db.connect();
    await db.disconnect();
    
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
  } catch (error) {
    res.writeHead(503);
    res.end(JSON.stringify({ status: 'error' }));
  }
}
```

## Monitoring

### Log Aggregation

Check application logs:

```bash
# Vercel
vercel logs

# Netlify
netlify logs:functions

# Docker
docker logs container-name
```

### Error Tracking

Integrate error tracking:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

export async function loader(ctx: LoaderContext) {
  try {
    return await fetchData();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}
```

### Performance Monitoring

Track metrics:

```typescript
export async function loader(ctx: LoaderContext) {
  const start = Date.now();
  
  const data = await fetchData();
  
  const duration = Date.now() - start;
  console.log(`Data fetched in ${duration}ms`);
  
  return data;
}
```

## Rollback Strategy

Keep previous builds available:

```bash
# Keep last 5 builds
dist-v1/
dist-v2/
dist-v3/
dist-latest/
```

If new build fails, restore from previous:

```bash
# Rollback
cp -r dist-v2/* dist-latest/
# Redeploy dist-latest/
```

## CDN Configuration

### Cache Headers

Set long cache for static assets:

```typescript
// site/(layout).tsx

export function Head() {
  return (
    <>
      {/* Static assets - cache forever */}
      <link rel="stylesheet" href="/assets/style.css" 
            media="all" onload="this.media='all'" />
      
      {/* Dynamic content - short cache */}
      <meta httpEquiv="cache-control" 
            content="public, max-age=300" />
    </>
  );
}
```

### CDN Purge

After deployment, clear CDN cache:

```bash
# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"files":["https://example.com/index.html"]}'

# AWS CloudFront
aws cloudfront create-invalidation \
  --distribution-id DIST_ID \
  --paths "/*"
```

## Performance Optimizations

### Compress Assets

Gzip/Brotli compression:

```typescript
// src/middleware/compression.ts

export const compressionMiddleware: Middleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('gzip')) {
    res.setHeader('content-encoding', 'gzip');
  }
  
  next();
};
```

### Minification

Ensure minification in production:

```typescript
const config: FrameworkConfig = {
  build: {
    minify: true,
    compress: true
  }
};
```

## Deployment Checklist

- [ ] Run `npm run typecheck` - No errors
- [ ] Run `npm run clean && npm run build` - Successful build
- [ ] Test locally - All routes work
- [ ] Run migrations - Database ready
- [ ] Set environment variables - All secrets configured
- [ ] Configure domain - DNS pointing to server
- [ ] Enable HTTPS - SSL certificate installed
- [ ] Set up monitoring - Logs and errors tracked
- [ ] Configure backups - Database backed up
- [ ] Test health endpoint - `/api/health` responds
- [ ] Load test - Performance acceptable
- [ ] Security scan - No vulnerabilities
- [ ] Monitor after deploy - Check logs for errors

## Rollback

If deployment fails, quickly rollback:

```bash
# Keep previous version running
pm2 list                    # See processes
pm2 revert                  # Revert to previous

# Or redeploy from git
git revert HEAD
npm run build
npm start
```

## Continuous Deployment

Set up CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install
        run: npm ci
      
      - name: Type Check
        run: npm run typecheck
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: npm run deploy
        env:
          DEPLOYMENT_TOKEN: ${{ secrets.DEPLOYMENT_TOKEN }}
```

## Next Steps

- [Performance](./performance) - Optimize your deployment
- [Build](./build) - Understand build process
