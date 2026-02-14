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
