import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const en = JSON.parse(readFileSync(join(__dirname, "./en.json"), "utf-8"));
const es = JSON.parse(readFileSync(join(__dirname, "./es.json"), "utf-8"));

type Locale = "en" | "es";

const translations: Record<Locale, Record<string, string>> = { en, es };

export class I18n {
  private locale: Locale;

  constructor(defaultLocale: Locale = "en") {
    this.locale = defaultLocale;
  }

  setLocale(locale: Locale) {
    this.locale = locale;
  }

  t(key: string) {
    return translations[this.locale][key] || key;
  }
}
