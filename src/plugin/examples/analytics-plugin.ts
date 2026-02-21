/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { JenPlugin, PluginContext, PluginHookContext, HookStage } from "../types.js";

/**
 * Example Analytics Plugin for Jen.js
 *
 * This plugin demonstrates how to integrate with analytics providers
 * to track pageviews and custom events.
 *
 * Fully hackable - replace with your own analytics system.
 *
 * @example
 * ```typescript
 * // In jen.config.ts
 * import { analyticsPlugin } from "jenjs/plugins/analytics";
 *
 * export default {
 *   // ... other config
 *   plugins: {
 *     plugins: [
 *       analyticsPlugin({
 *         provider: "google-analytics",
 *         trackingId: process.env.GA_TRACKING_ID,
 *         anonymizeIp: true
 *       })
 *     ]
 *   }
 * };
 * ```
 */

interface AnalyticsPluginConfig {
  provider: "google-analytics" | "segment" | "mixpanel" | "custom";
  trackingId?: string;
  apiKey?: string;
  anonymizeIp?: boolean;
  customTrackerFn?: (event: AnalyticsEvent) => Promise<void>;
}

interface AnalyticsEvent {
  type: "pageview" | "event" | "error";
  path?: string;
  eventName?: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Create an analytics plugin.
 */
export function createAnalyticsPlugin(config: AnalyticsPluginConfig): JenPlugin {
  const events: AnalyticsEvent[] = [];

  return {
    name: "jen-analytics",
    version: "1.0.0",
    description: "Track pageviews and events with analytics provider",

    async init(pluginContext: PluginContext) {
      console.log(`[Analytics Plugin] Initialized with provider: ${config.provider}`);
    },

    hooks: {
      // Track pageviews
      [HookStage.BEFORE_REQUEST]: async (context: PluginHookContext) => {
        const path = context.request?.req.url || "/";

        const event: AnalyticsEvent = {
          type: "pageview",
          path,
          timestamp: Date.now(),
        };

        events.push(event);

        // Send to analytics provider
        await trackEvent(event, config);
      },

      // Inject analytics script into rendered pages
      [HookStage.AFTER_RENDER]: async (context: PluginHookContext) => {
        const analyticsScript = generateAnalyticsScript(config);

        let html = context.data?.html as string;
        if (html) {
          // Inject before closing body tag
          html = html.replace("</body>", `${analyticsScript}</body>`);

          if (context.mutate) {
            context.mutate("html", html);
          }
        }
      },

      // Flush events before build
      [HookStage.BEFORE_BUILD]: async (context: PluginHookContext) => {
        console.log(`[Analytics Plugin] Flushing ${events.length} events...`);

        for (const event of events) {
          await trackEvent(event, config);
        }

        events.length = 0;
      },
    },
  };
}

/**
 * Track an analytics event.
 */
async function trackEvent(event: AnalyticsEvent, config: AnalyticsPluginConfig): Promise<void> {
  switch (config.provider) {
    case "google-analytics":
      await trackGoogleAnalytics(event, config);
      break;
    case "segment":
      await trackSegment(event, config);
      break;
    case "mixpanel":
      await trackMixpanel(event, config);
      break;
    case "custom":
      if (config.customTrackerFn) {
        await config.customTrackerFn(event);
      }
      break;
  }
}

/**
 * Track event in Google Analytics.
 */
async function trackGoogleAnalytics(event: AnalyticsEvent, config: AnalyticsPluginConfig): Promise<void> {
  // Mock implementation - in production, use the GA SDK
  const trackingId = config.trackingId || "UA-XXXXXXXXX-X";

  const params = new URLSearchParams({
    v: "1", // API version
    tid: trackingId,
    cid: generateClientId(),
    t: event.type === "pageview" ? "pageview" : "event",
  });

  if (event.type === "pageview" && event.path) {
    params.append("dp", event.path);
  }

  if (event.type === "event" && event.eventName) {
    params.append("ec", "engagement");
    params.append("ea", event.eventName);
  }

  if (config.anonymizeIp) {
    params.append("aip", "1");
  }

  console.log(`[Analytics] GA: ${event.type} → ${event.path || event.eventName}`);

  // In production: fetch("https://www.google-analytics.com/collect", { method: "POST", body: params });
}

/**
 * Track event in Segment.
 */
async function trackSegment(event: AnalyticsEvent, config: AnalyticsPluginConfig): Promise<void> {
  // Mock implementation - in production, use the Segment SDK
  const apiKey = config.apiKey || "YOUR_SEGMENT_API_KEY";

  const payload = {
    type: event.type === "pageview" ? "page" : "track",
    userId: generateClientId(),
    timestamp: new Date(event.timestamp).toISOString(),
    context: {
      library: { name: "jen.js" },
    },
  };

  if (event.type === "pageview" && event.path) {
    Object.assign(payload, { name: "Page Viewed", properties: { path: event.path } });
  }

  if (event.type === "event" && event.eventName) {
    Object.assign(payload, { event: event.eventName, properties: event.properties });
  }

  console.log(`[Analytics] Segment: ${event.type}`);

  // In production: fetch("https://api.segment.io/v1/track", { method: "POST", body: JSON.stringify(payload) });
}

/**
 * Track event in Mixpanel.
 */
async function trackMixpanel(event: AnalyticsEvent, config: AnalyticsPluginConfig): Promise<void> {
  // Mock implementation - in production, use the Mixpanel SDK
  const token = config.apiKey || "YOUR_MIXPANEL_TOKEN";

  const payload = {
    event: event.type === "pageview" ? "Page View" : event.eventName || "Event",
    properties: {
      token,
      "distinct_id": generateClientId(),
      "time": event.timestamp,
      ...(event.type === "pageview" && event.path ? { page: event.path } : {}),
      ...event.properties,
    },
  };

  console.log(`[Analytics] Mixpanel: ${payload.event}`);

  // In production: fetch("https://api.mixpanel.com/track", { method: "POST", body: JSON.stringify([payload]) });
}

/**
 * Generate analytics script to inject into HTML.
 */
function generateAnalyticsScript(config: AnalyticsPluginConfig): string {
  switch (config.provider) {
    case "google-analytics":
      return `
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.trackingId || "UA-XXXXXXXXX-X"}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.trackingId || "UA-XXXXXXXXX-X"}');
</script>`;

    case "segment":
      return `
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var t=analytics.methods[e];analytics[t]=analytics.factory(t)}analytics.load=function(e,t){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+e+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=t};analytics.SNIPPET_VERSION="4.4.0";analytics.load("${config.apiKey || "YOUR_SEGMENT_API_KEY"}");analytics.page();}}();
</script>`;

    case "mixpanel":
      return `
<script async src="//cdn.mxpnl.com/libs/mixpanel-latest.min.js"></script>
<script>
  mixpanel.init("${config.apiKey || "YOUR_MIXPANEL_TOKEN"}");
  mixpanel.track("Page Viewed");
</script>`;

    default:
      return "";
  }
}

/**
 * Generate a unique client ID.
 */
function generateClientId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
