# Jen.js Telemetry Client

Client-side telemetry for Jen.js framework. Sends usage metrics to the telemetry API.

## Usage

```typescript
import { createTelemetry } from "@src/telemetry/client.js";

const telemetry = createTelemetry("0.1.0", {
  endpoint: "https://jenjs-telemetry.vercel.app/telemetry",
});

// Track events
telemetry.track({
  command: "dev",
  os: process.platform,
});

// Auto-flushes every 15s or at 50 events
// Manual flush:
await telemetry.flush();
```

## Configuration

```typescript
const telemetry = createTelemetry(version, {
  endpoint: string;        // API endpoint (default: https://jenjs-telemetry.vercel.app/telemetry)
  batchSize: number;       // Events per batch (default: 50)
  batchInterval: number;   // Flush interval in ms (default: 15000)
  disabled: boolean;       // Disable telemetry (default: false)
});
```

## Disabling Telemetry

- **Local dev**: Disabled by default (enabled only when `CI=true` or `TELEMETRY_ENABLED=1`)
- **Runtime**: `telemetry.disable()`
- **Environment**: `TELEMETRY_DISABLED=1`

## Integration

Already integrated into:

- `server.ts` - Tracks dev/build commands
- `build.ts` - Tracks build duration and success

## API Service

The API server is in a separate repository at `G:\telemetry` and deployed to Vercel.

See `SETUP.md` for configuration details.
