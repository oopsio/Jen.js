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
