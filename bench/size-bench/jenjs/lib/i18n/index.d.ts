type Locale = "en" | "es";
export declare class I18n {
  private locale;
  constructor(defaultLocale?: Locale);
  setLocale(locale: Locale): void;
  t(key: string): string;
}
export {};
