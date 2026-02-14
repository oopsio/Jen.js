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

import { h } from 'preact';
import { useState } from 'preact/hooks';

export interface NavProps {
  config: any;
}

export function Nav({ config }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav class="jenpress-nav">
      <div class="nav-container">
        <div class="nav-brand">
          {config.logo && <img src={config.logo} alt="logo" class="nav-logo" />}
          <a href="/">{config.title}</a>
        </div>

        <button
          class="nav-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul class={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {config.themeConfig?.nav?.map((link: any) => (
            <li key={link.link}>
              <a href={link.link} class="nav-link">
                {link.text}
              </a>
            </li>
          ))}
          {config.themeConfig?.repo && (
            <li>
              <a href={config.themeConfig.repo} class="nav-link" target="_blank">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
