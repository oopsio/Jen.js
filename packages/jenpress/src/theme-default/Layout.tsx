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
