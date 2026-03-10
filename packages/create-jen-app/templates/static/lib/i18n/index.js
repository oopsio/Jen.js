import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const en = JSON.parse(readFileSync(join(__dirname, "./en.json"), "utf-8"));
const es = JSON.parse(readFileSync(join(__dirname, "./es.json"), "utf-8"));
const translations = { en, es };
export class I18n {
  locale;
  constructor(defaultLocale = "en") {
    this.locale = defaultLocale;
  }
  setLocale(locale) {
    this.locale = locale;
  }
  t(key) {
    return translations[this.locale][key] || key;
  }
}
