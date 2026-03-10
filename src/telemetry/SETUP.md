# Telemetry System Setup

## Overview

The Jen.js telemetry system consists of:

1. **API Server** (`src/telemetry/api/`) - Hosted on Vercel
2. **Client** (`src/telemetry/client.ts`) - Used in Jen.js CLI
3. **GitHub Integration** - Stores events in a private repo

## Prerequisites

- GitHub Personal Access Token (with `contents` permission)
- Private GitHub repository for telemetry storage
- Vercel account

## Step 1: Create GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Grant `repo` (full control of private repos)
4. Copy and save the token

## Step 2: Create Telemetry Repository

Create a private repository on GitHub (e.g., `jenjs-telemetry`). This is where telemetry events will be stored.

## Step 3: Set Environment Variables

### Local Development

Copy `.env.example` to `.env`:

```bash
cp src/telemetry/.env.example .env
```

Edit and fill in:

```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=jenjs-telemetry
NODE_ENV=development
DEBUG_TELEMETRY=1
```

### Vercel Deployment

Set environment variables in Vercel dashboard:

```
GITHUB_TOKEN = ghp_xxx...
GITHUB_OWNER = oopsio
GITHUB_REPO = jenjs-telemetry
```

## Step 4: Deploy to Vercel

Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel deploy
```

Option B: Connect GitHub repo to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import the jen.js repository
4. Add environment variables
5. Deploy

## Step 5: Integrate into Jen.js

In `src/index.ts` or `server.ts`:

```typescript
import { createTelemetry } from "./telemetry/client.js";

const telemetry = createTelemetry("0.1.0", {
  endpoint: "https://jenjs-telemetry.vercel.app/telemetry",
});

// Track dev command
if (process.argv[2] === "dev") {
  telemetry.track({ command: "dev" });
}

// Ensure flush on exit
process.on("exit", () => {
  telemetry.flush();
});
```

## Step 6: Test the System

### Test Client (with local API)

```bash
# Start local API
npm run dev

# In another terminal, test client
node -e "
import { createTelemetry } from './src/telemetry/client.ts';
const t = createTelemetry('0.1.0', { endpoint: 'http://localhost:3000/telemetry' });
t.track({ command: 'test' });
await t.flush();
"
```

### Test API Directly

```bash
# Start API
npm run dev

# Send test event
curl -X POST http://localhost:3000/telemetry \
  -H "Content-Type: application/json" \
  -d '{"framework":"jenjs","version":"0.1.0","command":"dev"}'

# Check health
curl http://localhost:3000/health
```

## Step 7: Monitor Telemetry

Events are stored in GitHub repo as:

```
telemetry/2026-03-06.json
telemetry/2026-03-07.json
```

Each file contains an array of events:

```json
[
  {
    "framework": "jenjs",
    "version": "0.1.0",
    "command": "dev",
    "os": "win32",
    "country": "IN",
    "timestamp": 1741270012
  }
]
```

## Rate Limiting

- **Limit**: 10 requests per minute per IP
- **Response**: 429 Too Many Requests
- **Reset**: Automatic after 1 minute

## Disable Telemetry

Set environment variable:

```env
TELEMETRY_DISABLED=1
```

Or at runtime:

```typescript
telemetry.disable();
```

## API Endpoints

### POST /telemetry

Accept telemetry events.

**Request:**

```json
{
  "framework": "jenjs",
  "version": "0.1.0",
  "command": "dev",
  "os": "win32"
}
```

**Responses:**

- `200` - Success
- `400` - Invalid payload
- `429` - Rate limited
- `503` - Telemetry disabled

### GET /health

Health check endpoint. Returns `200` with `{ status: "ok" }`.

## Architecture

```
Client (CLI)
    ↓ (batch events every 15s)
    ↓
Client Buffer (up to 50 events)
    ↓ (HTTP POST)
    ↓
Vercel API
    ↓ (validate, rate limit)
    ↓
API Buffer (up to 100 events)
    ↓ (commit every 60s or when full)
    ↓
GitHub API
    ↓
Private Repo (telemetry/YYYY-MM-DD.json)
```

## Production Checklist

- [ ] GitHub token created and stored securely
- [ ] Telemetry repo created and private
- [ ] Vercel project deployed
- [ ] Environment variables set in Vercel
- [ ] Client integrated into Jen.js
- [ ] Tests passing (`npm run test`)
- [ ] Health endpoint responding
- [ ] Events being stored in GitHub repo

## Troubleshooting

### Events not appearing in GitHub

1. Check Vercel logs: `vercel logs`
2. Verify GitHub token has correct permissions
3. Check repository exists and is private
4. Verify GITHUB_OWNER and GITHUB_REPO are correct

### Rate limiting too aggressive

Edit `src/telemetry/api/rate-limiter.ts`:

```typescript
const REQUESTS_PER_MINUTE = 10; // Increase this
```

### Client events not sending

1. Check endpoint URL is correct
2. Verify network requests (DevTools → Network)
3. Set `DEBUG_TELEMETRY=1` environment variable
4. Check client is calling `flush()` or waiting for timeout

### High API costs

Telemetry is batched and sent at most once per minute per client. To reduce API calls:

1. Increase `batchInterval` in client
2. Increase `BATCH_SIZE` in GitHub integration
3. Implement sampling in client (drop some events)

## Security Considerations

- **IP addresses**: Not stored, only used for rate limiting and country detection
- **Data**: Stored in private GitHub repo, accessible only with token
- **Token**: Never exposed in client code, only used server-side
- **Validation**: Strict schema validation on all inputs
- **Rate limiting**: Prevents abuse and keeps costs low

## Future Enhancements

- [ ] Implement GeoIP database for better country detection
- [ ] Add data retention policies (delete old telemetry files)
- [ ] Implement sampling for very high-volume metrics
- [ ] Add optional encryption at rest
- [ ] Create visualization dashboard
- [ ] Implement analytics queries (country distribution, popular commands, etc.)
