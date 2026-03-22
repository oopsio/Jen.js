/**
 * DevTools Type Definitions
 * Zero-Production-Cost Sidecar System
 */

// ============================================================================
// ROUTER TELEMETRY
// ============================================================================

export interface RouteMatchTrace {
  pathname: string;
  matched: boolean;
  matchedPath: string;
  params: Record<string, string>;
  executionTime: number; // ms
  wasmCallCount: number;
}

// ============================================================================
// SECURITY AUDIT
// ============================================================================

export interface SecurityHeader {
  name: string;
  value: string | null;
  compliant: boolean;
  standard:
    | 'CSP'
    | 'HSTS'
    | 'X-Frame-Options'
    | 'X-Content-Type-Options'
    | 'OTHER';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface SecurityAuditResult {
  timestamp: number;
  url: string;
  headers: SecurityHeader[];
  overallCompliant: boolean;
  warnings: string[];
}

// ============================================================================
// SSR/HYDRATION MAPPING
// ============================================================================

export interface DOMNode {
  tag: string;
  id?: string;
  class?: string;
  children: DOMNode[];
}

export interface HydrationChecksum {
  serverChecksum: string;
  clientChecksum: string;
  nodeCount: number;
  mismatches: {
    path: string;
    serverValue: string;
    clientValue: string;
  }[];
}

export interface SSRMetrics {
  renderTime: number; // ms
  componentCount: number;
  hydrationStatus: 'success' | 'mismatch' | 'pending';
  hydrationChecksum: HydrationChecksum | null;
}

// ============================================================================
// DATABASE DRIVER MONITORING
// ============================================================================

export interface QueryLog {
  id: string;
  query: string;
  duration: number; // ms
  timestamp: number;
  driver: string;
  status: 'success' | 'error' | 'slow';
  error?: string;
  rows?: number;
}

export interface DriverMetrics {
  totalQueries: number;
  totalTime: number;
  slowQueries: QueryLog[];
  avgQueryTime: number;
  lastQuery: QueryLog | null;
}

// ============================================================================
// DEVTOOLS MESSAGE PROTOCOL (WebSocket)
// ============================================================================

export type DevToolsMessageType =
  | 'route-trace'
  | 'security-audit'
  | 'ssr-metrics'
  | 'query-log'
  | 'hydration-check'
  | 'heartbeat'
  | 'config';

export interface DevToolsMessage<T = unknown> {
  type: DevToolsMessageType;
  timestamp: number;
  data: T;
  requestId?: string;
}

// ============================================================================
// DEVTOOLS STATE
// ============================================================================

export interface DevToolsState {
  enabled: boolean;
  wsUrl: string;
  currentRoute: RouteMatchTrace | null;
  lastSecurityAudit: SecurityAuditResult | null;
  lastSSRMetrics: SSRMetrics | null;
  driverMetrics: DriverMetrics | null;
  requestHistory: RouteMatchTrace[];
  queryHistory: QueryLog[];
}
