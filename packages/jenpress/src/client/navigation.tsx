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

export interface NavItem {
  path: string;
  title: string;
}

export interface NavigationProps {
  currentPath: string;
  allPages: NavItem[];
}

export function Navigation({ currentPath, allPages }: NavigationProps) {
  // Find breadcrumbs
  const breadcrumbs = currentPath
    .split('/')
    .filter(p => p)
    .reduce((acc, segment, i, arr) => {
      const path = '/' + arr.slice(0, i + 1).join('/');
      acc.push({ label: segment, path });
      return acc;
    }, [] as Array<{ label: string; path: string }>);

  // Find prev and next pages
  const currentIndex = allPages.findIndex(p => p.path === currentPath);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex >= 0 && currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return (
    <div>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav style={styles.breadcrumbs}>
          <a href="#" style={styles.breadcrumbLink}>
            Home
          </a>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              <span style={styles.separator}>/</span>
              <span style={styles.breadcrumbText}>{crumb.label}</span>
            </span>
          ))}
        </nav>
      )}

      {/* Prev/Next Navigation */}
      {(prevPage || nextPage) && (
        <nav style={styles.pageNav}>
          {prevPage ? (
            <a href={`#${prevPage.path}`} style={styles.prevLink}>
              ← {prevPage.title}
            </a>
          ) : (
            <div />
          )}
          {nextPage ? (
            <a href={`#${nextPage.path}`} style={styles.nextLink}>
              {nextPage.title} →
            </a>
          ) : (
            <div />
          )}
        </nav>
      )}
    </div>
  );
}

const styles = {
  breadcrumbs: {
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    color: '#666',
  },
  breadcrumbLink: {
    color: '#0066cc',
    textDecoration: 'none',
  },
  separator: {
    margin: '0 0.5rem',
    color: '#ccc',
  },
  breadcrumbText: {
    color: '#666',
  },
  pageNav: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px solid #eee',
  },
  prevLink: {
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  nextLink: {
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
};
