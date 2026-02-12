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
