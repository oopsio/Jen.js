/**
 * Theme Plugin
 * Manages light/dark mode and custom theme configuration
 */

type Theme = "light" | "dark" | "auto";

interface ThemeConfig {
  defaultTheme?: Theme;
  storageKey?: string;
}

class ThemeManager {
  private currentTheme: Theme;
  private config: ThemeConfig;
  private storageKey: string;

  constructor(config: ThemeConfig = {}) {
    this.config = config;
    this.storageKey = config.storageKey || "app-theme";
    this.currentTheme = this.loadTheme();
    this.applyTheme();
  }

  private loadTheme(): Theme {
    if (typeof localStorage === "undefined") {
      return this.config.defaultTheme || "light";
    }

    const stored = localStorage.getItem(this.storageKey) as Theme | null;
    if (stored) return stored;

    return this.config.defaultTheme || this.getSystemTheme();
  }

  private getSystemTheme(): Theme {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  private applyTheme() {
    if (typeof document === "undefined") return;

    const theme =
      this.currentTheme === "auto" ? this.getSystemTheme() : this.currentTheme;

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.storageKey, this.currentTheme);
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    this.applyTheme();
  }

  toggleTheme() {
    const nextTheme: Theme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(nextTheme);
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getEffectiveTheme(): "light" | "dark" {
    return this.currentTheme === "auto"
      ? this.getSystemTheme()
      : this.currentTheme;
  }
}

export const themeManager = new ThemeManager({
  defaultTheme: "light",
});
