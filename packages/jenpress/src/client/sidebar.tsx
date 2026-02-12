import { h } from 'preact';
import { useState } from 'preact/hooks';

export interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ items, currentPath, onNavigate }: SidebarProps) {
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

  const isActive = (link?: string) => {
    return link && currentPath === link;
  };

  const renderItems = (items: SidebarItem[], depth = 0): any[] => {
    return items.map((item) => {
      const hasChildren = item.items && item.items.length > 0;
      const isExpanded = expandedSections.has(item.text);

      return (
        <div key={item.text} style={{ ...styles.item, marginLeft: `${depth * 12}px` }}>
          {hasChildren ? (
            <button
              style={{
                ...styles.sectionButton,
                fontWeight: isExpanded ? '600' : '500',
              }}
              onClick={() => toggleSection(item.text)}
            >
              <span style={styles.toggle}>{isExpanded ? '▼' : '▶'}</span>
              {item.text}
            </button>
          ) : item.link ? (
            <a
              href={`#${item.link}`}
              style={{
                ...styles.link,
                ...(isActive(item.link) ? styles.activeLink : {}),
              }}
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = item.link!;
                onNavigate(item.link!);
              }}
            >
              {item.text}
            </a>
          ) : (
            <div style={styles.groupTitle}>{item.text}</div>
          )}

          {hasChildren && isExpanded && (
            <div>{renderItems(item.items!, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>{renderItems(items)}</nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    borderRight: '1px solid var(--border)',
    paddingRight: '1rem',
    height: 'calc(100vh - 60px)',
    overflowY: 'auto',
    position: 'sticky' as const,
    top: '60px',
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
  } as any,
  nav: {
    padding: '1rem 0',
  },
  item: {
    marginBottom: '0.5rem',
  },
  sectionButton: {
    background: 'none',
    border: 'none',
    padding: '0.5rem',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--fg)',
    textAlign: 'left' as const,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s, color 0.2s',
  } as any,
  toggle: {
    fontSize: '0.75rem',
    width: '1rem',
    textAlign: 'center' as const,
  },
  link: {
    display: 'block',
    padding: '0.5rem',
    color: '#0070f3',
    textDecoration: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    borderLeft: '3px solid transparent',
    paddingLeft: 'calc(0.5rem - 3px)',
  },
  activeLink: {
    backgroundColor: 'var(--border-light)',
    borderLeftColor: '#0070f3',
    fontWeight: '600',
    color: '#0070f3',
  },
  groupTitle: {
    padding: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--fg-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as any,
};
