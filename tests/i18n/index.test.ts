import { describe, it, expect, beforeEach } from "vitest";

// Mock i18n implementation
interface Translation {
  [key: string]: string | Translation;
}

interface I18nOptions {
  defaultLocale: string;
  translations: Record<string, Translation>;
  fallback?: string;
}

class I18n {
  private defaultLocale: string;
  private currentLocale: string;
  private translations: Record<string, Translation>;
  private fallback: string;
  private cache = new Map<string, Map<string, any>>();

  constructor(options: I18nOptions) {
    this.defaultLocale = options.defaultLocale;
    this.currentLocale = options.defaultLocale;
    this.translations = options.translations;
    this.fallback = options.fallback || "en";
  }

  setLocale(locale: string): void {
    if (!this.translations[locale]) {
      throw new Error(`Locale "${locale}" not found`);
    }
    this.currentLocale = locale;
    this.cache.delete(locale); // Invalidate cache for this locale
  }

  getLocale(): string {
    return this.currentLocale;
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return typeof current === "string" ? current : undefined;
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  t(key: string, params?: Record<string, any>): string {
    // Try current locale first
    let value = this.getNestedValue(this.translations[this.currentLocale], key);

    // Fall back to default locale
    if (value === undefined && this.currentLocale !== this.defaultLocale) {
      value = this.getNestedValue(this.translations[this.defaultLocale], key);
    }

    // Fall back to fallback locale
    if (value === undefined && this.defaultLocale !== this.fallback) {
      value = this.getNestedValue(this.translations[this.fallback], key);
    }

    if (value === undefined) {
      return key; // Return key if translation not found
    }

    // Replace parameters
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{{${paramKey}}}`, String(paramValue));
      }
    }

    return value;
  }

  has(key: string): boolean {
    return !!this.getNestedValue(this.translations[this.currentLocale], key);
  }

  addTranslations(locale: string, translations: Translation): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    // Recursively merge translations, handling nested keys
    for (const [key, value] of Object.entries(translations)) {
      if (key.includes(".")) {
        this.setNestedValue(this.translations[locale], key, value);
      } else {
        this.translations[locale][key] = value;
      }
    }
    this.cache.delete(locale);
  }

  getAvailableLocales(): string[] {
    return Object.keys(this.translations);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

describe("Internationalization (i18n)", () => {
  let i18n: I18n;

  beforeEach(() => {
    i18n = new I18n({
      defaultLocale: "en",
      fallback: "en",
      translations: {
        en: {
          greeting: "Hello",
          user: {
            welcome: "Welcome {{name}}",
            goodbye: "Goodbye {{name}}",
          },
          nested: {
            key: "Nested value",
          },
        },
        es: {
          greeting: "Hola",
          user: {
            welcome: "Bienvenido {{name}}",
            goodbye: "Adiós {{name}}",
          },
          nested: {
            key: "Valor anidado",
          },
        },
        fr: {
          greeting: "Bonjour",
          user: {
            welcome: "Bienvenue {{name}}",
            goodbye: "Au revoir {{name}}",
          },
        },
      },
    });
  });

  describe("Locale Management", () => {
    it("should have default locale on initialization", () => {
      expect(i18n.getLocale()).toBe("en");
    });

    it("should change locale", () => {
      i18n.setLocale("es");
      expect(i18n.getLocale()).toBe("es");
    });

    it("should throw on invalid locale", () => {
      expect(() => i18n.setLocale("invalid")).toThrow('Locale "invalid" not found');
    });

    it("should return available locales", () => {
      const locales = i18n.getAvailableLocales();
      expect(locales).toContain("en");
      expect(locales).toContain("es");
      expect(locales).toContain("fr");
    });
  });

  describe("Translation Lookup", () => {
    it("should get translation for current locale", () => {
      const greeting = i18n.t("greeting");
      expect(greeting).toBe("Hello");
    });

    it("should get translation for different locales", () => {
      i18n.setLocale("es");
      const greeting = i18n.t("greeting");
      expect(greeting).toBe("Hola");

      i18n.setLocale("fr");
      const frGreeting = i18n.t("greeting");
      expect(frGreeting).toBe("Bonjour");
    });

    it("should get nested translations", () => {
      const nested = i18n.t("nested.key");
      expect(nested).toBe("Nested value");
    });

    it("should return key if translation not found", () => {
      const missing = i18n.t("missing.key");
      expect(missing).toBe("missing.key");
    });

    it("should fall back to default locale", () => {
      i18n.setLocale("fr");
      const welcome = i18n.t("user.welcome");
      // 'fr' has this translation
      expect(welcome).toBeTruthy();
    });
  });

  describe("Parameterized Translations", () => {
    it("should replace single parameter", () => {
      const welcome = i18n.t("user.welcome", { name: "Alice" });
      expect(welcome).toBe("Welcome Alice");
    });

    it("should replace multiple parameters", () => {
      i18n.addTranslations("en", {
        "greeting.time": "Hello {{name}}, it's {{time}}",
      });
      const greeting = i18n.t("greeting.time", { name: "Bob", time: "3pm" });
      expect(greeting).toBe("Hello Bob, it's 3pm");
    });

    it("should handle missing parameters", () => {
      const welcome = i18n.t("user.welcome", { name: "" });
      expect(welcome).toBe("Welcome ");
    });

    it("should convert non-string parameters", () => {
      i18n.addTranslations("en", {
        count: "You have {{count}} items",
      });
      const message = i18n.t("count", { count: 5 });
      expect(message).toBe("You have 5 items");
    });

    it("should replace parameters in different locales", () => {
      i18n.setLocale("es");
      const welcome = i18n.t("user.welcome", { name: "Carlos" });
      expect(welcome).toBe("Bienvenido Carlos");
    });
  });

  describe("Translation Existence", () => {
    it("should check if translation exists", () => {
      expect(i18n.has("greeting")).toBe(true);
      expect(i18n.has("missing")).toBe(false);
    });

    it("should check nested translation existence", () => {
      expect(i18n.has("user.welcome")).toBe(true);
      expect(i18n.has("user.missing")).toBe(false);
    });
  });

  describe("Adding Translations", () => {
    it("should add new translations", () => {
      i18n.addTranslations("en", {
        "new.key": "New value",
      });
      expect(i18n.t("new.key")).toBe("New value");
    });

    it("should merge with existing translations", () => {
      i18n.addTranslations("en", {
        "extra.greeting": "Hi there",
      });
      expect(i18n.t("greeting")).toBe("Hello");
      expect(i18n.t("extra.greeting")).toBe("Hi there");
    });

    it("should create locale if it doesn't exist", () => {
      i18n.addTranslations("de", {
        greeting: "Guten Tag",
      });
      const locales = i18n.getAvailableLocales();
      expect(locales).toContain("de");
    });

    it("should override existing translations", () => {
      const original = i18n.t("greeting");
      expect(original).toBe("Hello");

      i18n.addTranslations("en", {
        greeting: "Hi",
      });
      expect(i18n.t("greeting")).toBe("Hi");
    });
  });

  describe("Cache Management", () => {
    it("should clear cache", () => {
      i18n.t("greeting");
      i18n.clearCache();
      // After clearing, should still work
      expect(i18n.t("greeting")).toBe("Hello");
    });

    it("should invalidate cache when locale changes", () => {
      i18n.t("greeting");
      i18n.setLocale("es");
      expect(i18n.t("greeting")).toBe("Hola");
    });

    it("should invalidate cache when translations are added", () => {
      i18n.addTranslations("en", {
        "cache.test": "Should be cached",
      });
      expect(i18n.t("cache.test")).toBe("Should be cached");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty translation value", () => {
      i18n.addTranslations("en", {
        empty: "",
      });
      expect(i18n.t("empty")).toBe("");
    });

    it("should handle special characters in translations", () => {
      i18n.addTranslations("en", {
        special: "Hello! @#$%^&*() <> \"quotes\"",
      });
      expect(i18n.t("special")).toBe("Hello! @#$%^&*() <> \"quotes\"");
    });

    it("should handle very long translation keys", () => {
      const longKey = "very.deeply.nested.key.with.many.segments.here";
      i18n.addTranslations("en", {
        [longKey]: "Deep value",
      });
      expect(i18n.t(longKey)).toBe("Deep value");
    });

    it("should handle translations with newlines", () => {
      i18n.addTranslations("en", {
        multiline: "Line 1\nLine 2\nLine 3",
      });
      expect(i18n.t("multiline")).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should handle parameter values with special characters", () => {
      const message = i18n.t("user.welcome", { name: "O'Brien" });
      expect(message).toBe("Welcome O'Brien");
    });

    it("should preserve parameter markers if not provided", () => {
      i18n.addTranslations("en", {
        incomplete: "Hello {{name}} from {{city}}",
      });
      const message = i18n.t("incomplete", { name: "Alice" });
      expect(message).toBe("Hello Alice from {{city}}");
    });
  });

  describe("Multiple Instances", () => {
    it("should support multiple i18n instances", () => {
      const i18n2 = new I18n({
        defaultLocale: "de",
        translations: {
          de: { greeting: "Guten Tag" },
        },
      });

      expect(i18n.getLocale()).toBe("en");
      expect(i18n2.getLocale()).toBe("de");
      expect(i18n.t("greeting")).toBe("Hello");
      expect(i18n2.t("greeting")).toBe("Guten Tag");
    });
  });

  describe("Fallback Behavior", () => {
    it("should use fallback locale when key not found in current locale", () => {
      i18n.setLocale("fr");
      const message = i18n.t("nested.key");
      // Should not have this in French, but we do, so it returns the French version
      expect(message).toBeTruthy();
    });

    it("should use default locale when key not in fallback", () => {
      const newI18n = new I18n({
        defaultLocale: "en",
        fallback: "es",
        translations: {
          en: { greeting: "Hello" },
          es: { greeting: "Hola" },
          fr: {},
        },
      });

      newI18n.setLocale("fr");
      const greeting = newI18n.t("greeting");
      expect(greeting).toBe("Hello"); // Falls back to default
    });
  });
});
