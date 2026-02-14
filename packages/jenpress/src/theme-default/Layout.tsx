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

import { h, Fragment } from 'preact';
import type { PageData } from '../node/config.js';
import { Nav } from './Nav.js';
import { Sidebar } from './Sidebar.js';
import { Outline } from './Outline.js';
import './Layout.css';

export interface LayoutProps {
  page: PageData;
  config: any;
  children: any;
}

export default function Layout({ page, config, children }: LayoutProps) {
  return (
    <div class="jenpress-layout">
      <Nav config={config} />

      <div class="layout-container">
        <Sidebar config={config} />

        <main class="main-content">
          <article class="md-content">
            <h1>{page.title}</h1>
            {page.description && <p class="description">{page.description}</p>}
            {children}
          </article>

          <div class="page-nav">
            {/* Previous/Next page navigation */}
          </div>
        </main>

        <Outline page={page} />
      </div>

      <footer class="jenpress-footer">
        <p>&copy; {new Date().getFullYear()} {config.title}. Built with JenPress.</p>
      </footer>
    </div>
  );
}
