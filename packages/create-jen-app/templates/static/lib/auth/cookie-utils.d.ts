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
 * Secure cookie utilities for session management
 * Ensures cookies have proper security flags
 */
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  maxAge?: number;
  path?: string;
  domain?: string;
}
/**
 * Generate secure cookie header value
 */
export declare function createSecureCookie(
  name: string,
  value: string,
  options?: CookieOptions,
): string;
/**
 * Parse cookies from request header
 */
export declare function parseCookies(
  cookieHeader: string,
): Record<string, string>;
/**
 * Validate session cookie - check all security properties
 */
export declare function validateSessionCookie(
  header: string,
  expectedName?: string,
): boolean;
