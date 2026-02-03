/**
 * Analytics Plugin
 * Tracks page views and user interactions
 */

interface AnalyticsConfig {
  trackingId?: string;
  debug?: boolean;
}

class Analytics {
  private config: AnalyticsConfig;
  private sessionId: string;

  constructor(config: AnalyticsConfig = {}) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      this.trackPageView();
      this.attachEventListeners();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackPageView() {
    if (typeof window === "undefined") return;

    const data = {
      event: "page_view",
      path: window.location.pathname,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.log("Page view tracked:", data);
  }

  trackEvent(name: string, properties?: Record<string, any>) {
    if (typeof window === "undefined") return;

    const data = {
      event: name,
      properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.log("Event tracked:", data);
  }

  private attachEventListeners() {
    // Track button clicks
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.className.includes("btn-")) {
        this.trackEvent("button_click", {
          text: target.textContent,
          class: target.className,
        });
      }
    });
  }

  private log(...args: any[]) {
    if (this.config.debug) {
      console.log("[Analytics]", ...args);
    }
  }
}

export const analytics = new Analytics({
  debug: true,
});
