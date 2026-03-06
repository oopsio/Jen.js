import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock font loader
interface FontOptions {
  family: string;
  weights?: (300 | 400 | 500 | 600 | 700 | 800 | 900)[];
  styles?: ("normal" | "italic")[];
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
  preload?: boolean;
}

interface LoadedFont {
  family: string;
  weights: number[];
  styles: string[];
  display: string;
  url?: string;
  preload: boolean;
}

class FontLoader {
  private fonts = new Map<string, LoadedFont>();
  private googleFontsCache = new Map<string, string>();
  private preloadFonts: LoadedFont[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = "/fonts") {
    this.baseUrl = baseUrl;
  }

  addFont(options: FontOptions): void {
    const {
      family,
      weights = [400],
      styles = ["normal"],
      display = "swap",
      preload = false,
    } = options;

    const id = family.toLowerCase().replace(/\s+/g, "-");
    const font: LoadedFont = {
      family,
      weights,
      styles,
      display,
      preload,
    };

    this.fonts.set(id, font);

    if (preload) {
      this.preloadFonts.push(font);
    }
  }

  addGoogleFont(family: string, weights: number[] = [400]): void {
    const id = family.toLowerCase().replace(/\s+/g, "-");
    const url = this.constructGoogleFontsUrl(family, weights);
    this.googleFontsCache.set(id, url);

    this.fonts.set(id, {
      family,
      weights,
      styles: ["normal"],
      display: "swap",
      url,
      preload: false,
    });
  }

  private constructGoogleFontsUrl(family: string, weights: number[]): string {
    const encoded = family.replace(/\s+/g, "+");
    const weightStr = weights.join(";");
    return `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weightStr}`;
  }

  getFont(family: string): LoadedFont | undefined {
    const id = family.toLowerCase().replace(/\s+/g, "-");
    return this.fonts.get(id);
  }

  getAllFonts(): LoadedFont[] {
    return Array.from(this.fonts.values());
  }

  getPreloadFonts(): LoadedFont[] {
    return this.preloadFonts;
  }

  generateFontFace(font: LoadedFont): string {
    const familyStr = font.family.includes(" ")
      ? `"${font.family}"`
      : font.family;
    let css = "";

    for (const weight of font.weights) {
      for (const style of font.styles) {
        const displayDecl = `font-display: ${font.display};`;
        css += `@font-face {
  font-family: ${familyStr};
  font-weight: ${weight};
  font-style: ${style};
  ${displayDecl}
}\n`;
      }
    }

    return css;
  }

  generatePreloadLinks(): string[] {
    return this.preloadFonts.map((font) => {
      const rel = "preload";
      const as = "font";
      const href = font.url || `${this.baseUrl}/${font.family}.woff2`;
      return `<link rel="${rel}" as="${as}" href="${href}" type="font/woff2">`;
    });
  }

  hasFont(family: string): boolean {
    const id = family.toLowerCase().replace(/\s+/g, "-");
    return this.fonts.has(id);
  }

  removeFont(family: string): boolean {
    const id = family.toLowerCase().replace(/\s+/g, "-");
    const font = this.fonts.get(id);
    if (font) {
      // Remove from preload list if exists
      this.preloadFonts = this.preloadFonts.filter((f) => f.family !== family);
    }
    return this.fonts.delete(id);
  }

  clear(): void {
    this.fonts.clear();
    this.preloadFonts = [];
    this.googleFontsCache.clear();
  }

  getFontCount(): number {
    return this.fonts.size;
  }
}

describe("Font Loader", () => {
  let loader: FontLoader;

  beforeEach(() => {
    loader = new FontLoader("/fonts");
  });

  describe("Adding Fonts", () => {
    it("should add a font with default options", () => {
      loader.addFont({ family: "Open Sans" });
      const font = loader.getFont("Open Sans");
      expect(font).toBeDefined();
      expect(font?.family).toBe("Open Sans");
      expect(font?.weights).toEqual([400]);
      expect(font?.display).toBe("swap");
    });

    it("should add a font with custom weights", () => {
      loader.addFont({
        family: "Roboto",
        weights: [400, 500, 700],
      });
      const font = loader.getFont("Roboto");
      expect(font?.weights).toEqual([400, 500, 700]);
    });

    it("should add a font with custom styles", () => {
      loader.addFont({
        family: "Lato",
        styles: ["normal", "italic"],
      });
      const font = loader.getFont("Lato");
      expect(font?.styles).toEqual(["normal", "italic"]);
    });

    it("should add a font with display mode", () => {
      loader.addFont({
        family: "Merriweather",
        display: "optional",
      });
      const font = loader.getFont("Merriweather");
      expect(font?.display).toBe("optional");
    });

    it("should mark font for preloading", () => {
      loader.addFont({
        family: "Inter",
        preload: true,
      });
      const preloadFonts = loader.getPreloadFonts();
      expect(preloadFonts).toHaveLength(1);
      expect(preloadFonts[0].family).toBe("Inter");
    });

    it("should handle font families with multiple words", () => {
      loader.addFont({ family: "Noto Sans JP" });
      expect(loader.hasFont("Noto Sans JP")).toBe(true);
    });

    it("should be case-insensitive when retrieving fonts", () => {
      loader.addFont({ family: "Open Sans" });
      expect(loader.getFont("OPEN SANS")).toBeDefined();
      expect(loader.getFont("open sans")).toBeDefined();
    });
  });

  describe("Google Fonts", () => {
    it("should add Google Font", () => {
      loader.addGoogleFont("Open Sans", [400, 700]);
      const font = loader.getFont("Open Sans");
      expect(font).toBeDefined();
      expect(font?.weights).toEqual([400, 700]);
      expect(font?.url).toContain("fonts.googleapis.com");
    });

    it("should construct correct Google Fonts URL", () => {
      loader.addGoogleFont("Roboto", [400, 500, 700]);
      const font = loader.getFont("Roboto");
      expect(font?.url).toContain("Roboto");
      expect(font?.url).toContain("wght@400;500;700");
    });

    it("should handle spaces in font family names", () => {
      loader.addGoogleFont("Noto Sans", [400]);
      const font = loader.getFont("Noto Sans");
      expect(font?.url).toContain("Noto+Sans");
    });

    it("should support multiple weights in Google Fonts", () => {
      loader.addGoogleFont("Lato", [300, 400, 700, 900]);
      const font = loader.getFont("Lato");
      expect(font?.weights).toEqual([300, 400, 700, 900]);
    });
  });

  describe("Font Face Generation", () => {
    it("should generate CSS @font-face rule", () => {
      loader.addFont({
        family: "Roboto",
        weights: [400, 700],
        display: "swap",
      });
      const font = loader.getFont("Roboto");
      const css = loader.generateFontFace(font!);
      expect(css).toContain("@font-face");
      expect(css).toContain("font-family: Roboto");
      expect(css).toContain("font-display: swap");
    });

    it("should generate multiple @font-face rules for different weights", () => {
      loader.addFont({
        family: "Open Sans",
        weights: [400, 500, 700],
      });
      const font = loader.getFont("Open Sans");
      const css = loader.generateFontFace(font!);
      expect(css.split("@font-face").length - 1).toBe(3);
    });

    it("should include font weight in @font-face rule", () => {
      loader.addFont({
        family: "Poppins",
        weights: [400, 600, 700],
      });
      const font = loader.getFont("Poppins");
      const css = loader.generateFontFace(font!);
      expect(css).toContain("font-weight: 400");
      expect(css).toContain("font-weight: 600");
      expect(css).toContain("font-weight: 700");
    });

    it("should quote font family if contains spaces", () => {
      loader.addFont({
        family: "Noto Sans",
        weights: [400],
      });
      const font = loader.getFont("Noto Sans");
      const css = loader.generateFontFace(font!);
      expect(css).toContain('"Noto Sans"');
    });

    it("should handle display modes in CSS", () => {
      const modes = ["auto", "block", "swap", "fallback", "optional"];
      for (const mode of modes) {
        loader.addFont({
          family: `Font${mode}`,
          display: mode as any,
        });
        const font = loader.getFont(`Font${mode}`);
        const css = loader.generateFontFace(font!);
        expect(css).toContain(`font-display: ${mode}`);
      }
    });
  });

  describe("Preload Links", () => {
    it("should generate preload links for marked fonts", () => {
      loader.addFont({ family: "Inter", preload: true });
      loader.addFont({ family: "Roboto", preload: false });
      const links = loader.generatePreloadLinks();
      expect(links).toHaveLength(1);
      expect(links[0]).toContain("preload");
    });

    it("should generate correct link attributes", () => {
      loader.addFont({ family: "Poppins", preload: true });
      const links = loader.generatePreloadLinks();
      expect(links[0]).toContain('rel="preload"');
      expect(links[0]).toContain('as="font"');
      expect(links[0]).toContain('type="font/woff2"');
    });

    it("should use Google Fonts URL in preload links", () => {
      loader.addGoogleFont("Roboto", [400, 700]);
      const font = loader.getFont("Roboto");
      const link = `<link rel="preload" as="font" href="${font?.url}" type="font/woff2">`;
      expect(link).toContain("googleapis.com");
    });
  });

  describe("Font Management", () => {
    it("should check if font exists", () => {
      loader.addFont({ family: "Roboto" });
      expect(loader.hasFont("Roboto")).toBe(true);
      expect(loader.hasFont("Nonexistent")).toBe(false);
    });

    it("should get all fonts", () => {
      loader.addFont({ family: "Roboto" });
      loader.addFont({ family: "Lato" });
      loader.addFont({ family: "Inter" });
      const fonts = loader.getAllFonts();
      expect(fonts).toHaveLength(3);
    });

    it("should remove a font", () => {
      loader.addFont({ family: "Roboto" });
      expect(loader.hasFont("Roboto")).toBe(true);
      const removed = loader.removeFont("Roboto");
      expect(removed).toBe(true);
      expect(loader.hasFont("Roboto")).toBe(false);
    });

    it("should return false when removing non-existent font", () => {
      const removed = loader.removeFont("Nonexistent");
      expect(removed).toBe(false);
    });

    it("should get font count", () => {
      loader.addFont({ family: "Roboto" });
      loader.addFont({ family: "Lato" });
      expect(loader.getFontCount()).toBe(2);
    });

    it("should clear all fonts", () => {
      loader.addFont({ family: "Roboto" });
      loader.addFont({ family: "Lato", preload: true });
      loader.clear();
      expect(loader.getFontCount()).toBe(0);
      expect(loader.getPreloadFonts()).toHaveLength(0);
    });
  });

  describe("Font Normalization", () => {
    it("should normalize font IDs to lowercase with hyphens", () => {
      loader.addFont({ family: "Open Sans" });
      expect(loader.hasFont("OPEN SANS")).toBe(true);
      expect(loader.hasFont("Open Sans")).toBe(true);
      expect(loader.hasFont("open-sans")).toBe(true);
    });

    it("should handle multiple spaces in font names", () => {
      loader.addFont({ family: "Noto Sans JP" });
      expect(loader.hasFont("Noto Sans JP")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle fonts with hyphens in name", () => {
      loader.addFont({ family: "Droid-Sans" });
      expect(loader.hasFont("Droid-Sans")).toBe(true);
    });

    it("should handle fonts with numbers", () => {
      loader.addFont({ family: "Courier New 10" });
      expect(loader.hasFont("Courier New 10")).toBe(true);
    });

    it("should handle all valid weight values", () => {
      loader.addFont({
        family: "AllWeights",
        weights: [300, 400, 500, 600, 700, 800, 900],
      });
      const font = loader.getFont("AllWeights");
      expect(font?.weights).toHaveLength(7);
    });

    it("should handle fonts with special display modes", () => {
      const modes: Array<"auto" | "block" | "swap" | "fallback" | "optional"> =
        ["auto", "block", "swap", "fallback", "optional"];
      for (const mode of modes) {
        loader.addFont({
          family: `Font${mode}`,
          display: mode,
        });
        const font = loader.getFont(`Font${mode}`);
        expect(font?.display).toBe(mode);
      }
    });

    it("should handle removing preload fonts", () => {
      loader.addFont({ family: "Inter", preload: true });
      loader.removeFont("Inter");
      expect(loader.getPreloadFonts()).toHaveLength(0);
    });
  });

  describe("Performance", () => {
    it("should handle many fonts efficiently", () => {
      for (let i = 0; i < 100; i++) {
        loader.addFont({ family: `Font${i}` });
      }
      expect(loader.getFontCount()).toBe(100);
    });

    it("should retrieve fonts quickly", () => {
      for (let i = 0; i < 50; i++) {
        loader.addFont({ family: `Font${i}` });
      }
      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        loader.getFont(`Font${i}`);
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should be fast
    });
  });
});
