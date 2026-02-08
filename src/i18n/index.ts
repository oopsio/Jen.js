import en from "./en.json";
import es from "./es.json";

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
