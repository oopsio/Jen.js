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

export interface OutlineItem {
  level: number;
  text: string;
  id: string;
}

export interface OutlineProps {
  items: OutlineItem[];
}

export function Outline({ items }: OutlineProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <aside style={styles.outline}>
      <h4 style={styles.title}>On this page</h4>
      <ul style={styles.list}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              ...styles.item,
              marginLeft: `${(item.level - 2) * 12}px`,
            }}
          >
            <a href={`#${item.id}`} style={styles.link}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

const styles = {
  outline: {
    width: '220px',
    fontSize: '0.875rem',
    height: 'calc(100vh - 60px)',
    overflowY: 'auto' as const,
    position: 'sticky' as const,
    top: '60px',
    paddingLeft: '1rem',
    borderLeft: '1px solid var(--border)',
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
  } as any,
  title: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 1rem 0',
    color: 'var(--fg)',
  } as any,
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  } as any,
  item: {
    marginBottom: '0.5rem',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
    display: 'block',
    padding: '0.25rem 0',
    borderLeft: '2px solid transparent',
    paddingLeft: '0.5rem',
    transition: 'all 0.2s',
  } as any,
};
