import en from "./en.json";
import es from "./es.json";
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
