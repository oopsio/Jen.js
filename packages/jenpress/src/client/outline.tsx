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
