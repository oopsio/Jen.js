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

export interface SidebarProps {
  config: any;
}

export function Sidebar({ config }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (text: string) => {
    const next = new Set(expandedSections);
    if (next.has(text)) {
      next.delete(text);
    } else {
      next.add(text);
    }
    setExpandedSections(next);
  };

  if (!config.themeConfig?.sidebar?.length) {
    return null;
  }

  return (
    <aside class="jenpress-sidebar">
      {config.themeConfig.sidebar.map((section: any) => (
        <div key={section.text} class="sidebar-section">
          <button
            class="sidebar-section-title"
            onClick={() => toggleSection(section.text)}
          >
            {section.text}
            <span class={`toggle-icon ${expandedSections.has(section.text) ? 'open' : ''}`}>
              ▶
            </span>
          </button>
          {expandedSections.has(section.text) && section.items && (
            <ul class="sidebar-items">
              {section.items.map((item: any) => (
                <li key={item.link}>
                  <a href={item.link} class="sidebar-link">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </aside>
  );
}
