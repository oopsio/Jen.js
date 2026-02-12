import { h, render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { highlightCode } from './highlight.js';
import { Sidebar, type SidebarItem } from './sidebar.tsx';
import { Search } from './search.tsx';
import { Navigation, type NavItem } from './navigation.tsx';
import { Outline, type OutlineItem } from './outline.tsx';
import { parseComponentTag, renderComponent } from './components.ts';

function WelcomePage() {
  return (
    <Fragment>
      <h1 style={styles.title}>Welcome to JenPress</h1>
      <p style={styles.subtitle}>
        A VitePress competitor - Markdown-first documentation SSG built for Jen.js
      </p>

      <section style={styles.section}>
        <h2>⚡ Features</h2>
        <ul style={styles.list}>
          <li>Fast Vite dev server with HMR</li>
          <li>Markdown-first with file-based routing</li>
          <li>Preact-based responsive theme</li>
          <li>Static site generation</li>
          <li>Zero config (mostly)</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2>🚀 Quick Start</h2>
        <pre style={styles.code}>
{`# Create markdown file
echo "# My Page" > docs/my-page.md

# Visit it directly in the browser
# http://localhost:5173/docs/my-page.md`}
        </pre>
      </section>

      <section style={styles.section}>
        <h2>📖 Example Pages</h2>
        <ul style={styles.list}>
          <li><a href="/docs/index.md" style={styles.link}>Welcome</a></li>
          <li><a href="/docs/guide/getting-started.md" style={styles.link}>Getting Started</a></li>
          <li><a href="/docs/api/overview.md" style={styles.link}>API Overview</a></li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2>⚙️ Configuration</h2>
        <p>Create <code>jenpress.config.ts</code> to customize:</p>
        <pre style={styles.code}>
{`import { defineConfig } from '@jenjs/jenpress';

export default defineConfig({
  title: 'My Docs',
  description: 'Built with JenPress',
});`}
        </pre>
      </section>

      <footer style={styles.footer}>
        <p>🎉 JenPress v0.1.0 - Ready to build documentation!</p>
      </footer>
    </Fragment>
  );
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

function Breadcrumbs({ path }: { path: string }) {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '' }];

  let currentPath = '';
  parts.slice(0, -1).forEach((part) => {
    currentPath += (currentPath ? '/' : '') + part;
    breadcrumbs.push({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      path: currentPath,
    });
  });

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    breadcrumbs.push({
      label: lastPart.replace('.md', '').charAt(0).toUpperCase() + lastPart.slice(1).replace('.md', ''),
    });
  }

  return (
    <div style={styles.breadcrumbs}>
      {breadcrumbs.map((crumb, idx) => (
        <Fragment key={idx}>
          {idx > 0 && <span style={styles.breadcrumbSeparator}>/</span>}
          {crumb.path !== undefined ? (
            <a href={`#${crumb.path}`} style={styles.breadcrumbLink}>
              {crumb.label}
            </a>
          ) : (
            <span style={styles.breadcrumbText}>{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function MarkdownPage({ path, isDark }: { path: string; isDark?: boolean }) {
  const [content, setContent] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(path);
  const [description, setDescription] = useState('');
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Load markdown file
    fetch(`/${path}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.text();
      })
      .then(async text => {
        // Parse frontmatter
        const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        let body = text;
        
        if (match) {
          const frontmatter = match[1];
          body = match[2];
          
          // Extract title from frontmatter
          const titleMatch = frontmatter.match(/title:\s*(.+)/);
          if (titleMatch) {
            setTitle(titleMatch[1].trim());
          }

          // Extract description from frontmatter
          const descMatch = frontmatter.match(/description:\s*(.+)/);
          if (descMatch) {
            setDescription(descMatch[1].trim());
          }
        }

        // Render markdown with syntax highlighting
        const rendered = await renderMarkdown(body, isDark);
        setContent(body);
        setHtml(rendered);
        
        // Extract outline items (headings)
        const outlineItems = extractOutlineItems(rendered);
        setOutlineItems(outlineItems);
      })
      .catch(err => {
        setError(err.message);
        setContent('');
        setHtml('');
      })
      .finally(() => setLoading(false));
  }, [path]);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>Error</h2>
        <p>{error}</p>
        <p><a href="/" style={styles.link}>Back to home</a></p>
      </div>
    );
  }

  return (
    <Fragment>
      <div style={styles.contentWrapper}>
        <div style={{ flex: 1 }}>
          <Breadcrumbs path={path} />
          <h1 style={styles.title}>{title}</h1>
          {description && <p style={styles.subtitle}>{description}</p>}
          <div
            style={styles.mdContent}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div style={styles.editLink}>
            <a href={`https://github.com/kessud2021/Jen.js/edit/main/packages/jenpress/${path}`} style={styles.link} target="_blank" rel="noopener noreferrer">
              ✏️ Edit on GitHub
            </a>
          </div>
          <div style={styles.footer}>
            <a href="/" style={styles.link}>← Back to home</a>
          </div>
        </div>
        <Outline items={outlineItems} />
      </div>
    </Fragment>
  );
}

async function renderMarkdown(content: string, isDark: boolean = false): Promise<string> {
  const lines = content.split('\n');
  const output: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockLang = 'text';
  let inTable = false;
  let inList = false;
  let tableBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for table (markdown table: | header | header |)
    if (line.match(/^\s*\|.*\|.*\|/)) {
      if (!inTable) {
        inTable = true;
        tableBuffer = [];
      }
      tableBuffer.push(line);
      
      // Check if next line is separator
      if (i + 1 < lines.length && lines[i + 1].match(/^\s*\|[\s\-:|]+\|/)) {
        tableBuffer.push(lines[i + 1]);
        i++; // Skip separator line
      }
      
      // Continue collecting table rows
      while (i + 1 < lines.length && lines[i + 1].match(/^\s*\|.*\|.*\|/)) {
        i++;
        tableBuffer.push(lines[i]);
      }
      
      // Render table
      if (tableBuffer.length > 0) {
        output.push(renderTable(tableBuffer));
        inTable = false;
        tableBuffer = [];
      }
      continue;
    }

    // Check for code block start
    const codeBlockMatch = line.match(/^```(.*)$/);
    if (codeBlockMatch) {
      if (inCodeBlock) {
        // End of code block
        const highlighted = await highlightCode(codeBlockContent, codeBlockLang, isDark);
        output.push(highlighted);
        inCodeBlock = false;
        codeBlockContent = '';
        codeBlockLang = 'text';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLang = codeBlockMatch[1].trim() || 'text';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent += (codeBlockContent ? '\n' : '') + line;
      continue;
    }

    // Check for callouts (> [!NOTE], > [!WARNING], etc.)
    const calloutMatch = line.match(/^>\s*\[!([A-Z]+)\]\s*(.*)$/);
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const title = calloutMatch[2] || type.toUpperCase();
      const icons: Record<string, string> = {
        note: '<i class="bi bi-info-circle"></i>',
        warning: '<i class="bi bi-exclamation-triangle"></i>',
        tip: '<i class="bi bi-lightbulb"></i>',
        danger: '<i class="bi bi-exclamation-octagon"></i>',
        info: '<i class="bi bi-info-circle-fill"></i>',
      };
      const icon = icons[type] || '<i class="bi bi-info-circle"></i>';
      
      // Collect all callout lines
      let calloutContent = title ? title : '';
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('> ')) {
        calloutContent += '\n' + lines[j].slice(2);
        j++;
      }
      i = j - 1;

      output.push(`<div class="callout callout-${type}"><div class="callout-header"><span class="callout-icon">${icon}</span><span class="callout-title">${title || type.toUpperCase()}</span></div><div class="callout-content">${formatInline(calloutContent)}</div></div>`);
      continue;
    }

    // Regular markdown parsing with IDs for outline
    if (line.startsWith('# ')) {
      const text = escapeHtml(line.slice(2));
      output.push(`<h1>${text}</h1>`);
    } else if (line.startsWith('## ')) {
      const text = escapeHtml(line.slice(3));
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      output.push(`<h2 id="${id}">${text}</h2>`);
    } else if (line.startsWith('### ')) {
      const text = escapeHtml(line.slice(4));
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      output.push(`<h3 id="${id}">${text}</h3>`);
    } else if (line.startsWith('#### ')) {
      const text = escapeHtml(line.slice(5));
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      output.push(`<h4 id="${id}">${text}</h4>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        inList = true;
        output.push('<ul>');
      }
      output.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else if (line.match(/^\d+\. /)) {
      if (!inList) {
        inList = true;
        output.push('<ol>');
      }
      output.push(`<li>${formatInline(line.replace(/^\d+\.\s*/, ''))}</li>`);
    } else if (line.trim() === '') {
      if (inList) {
        output.push(inList.toString().includes('ol') ? '</ol>' : '</ul>');
        inList = false;
      }
      output.push('');
    } else if (line.startsWith('> ')) {
      output.push(`<blockquote>${formatInline(line.slice(2))}</blockquote>`);
    } else {
      if (inList) {
        output.push(inList.toString().includes('ol') ? '</ol>' : '</ul>');
        inList = false;
      }
      output.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('\n');
}

function renderTable(lines: string[]): string {
  const rows = lines
    .filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'))
    .map(line => {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      return cells;
    });

  if (rows.length < 2) return '';

  const headerRow = rows[0];
  const bodyRows = rows.slice(2); // Skip header and separator

  let html = '<table class="md-table"><thead><tr>';
  headerRow.forEach(cell => {
    html += `<th>${formatInline(cell)}</th>`;
  });
  html += '</tr></thead><tbody>';

  bodyRows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${formatInline(cell)}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

function formatInline(text: string): string {
  // First, parse and render custom components
  let result = text;
  let componentParsed = true;
  
  while (componentParsed) {
    const parsed = parseComponentTag(result);
    if (parsed) {
      const rendered = renderComponent(parsed.tag, parsed.props, formatInline(parsed.content));
      result = rendered + parsed.rest;
    } else {
      componentParsed = false;
    }
  }
  
  // Then escape HTML (but preserve component tags)
  result = escapeHtml(result);
  
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Code
  result = result.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Links
  result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  return result;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

function extractOutlineItems(html: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  const headingRegex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h\1>/g;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    });
  }

  return items;
}

// Default sidebar configuration
const DEFAULT_SIDEBAR: SidebarItem[] = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Welcome', link: 'docs/index.md' },
      { text: 'Installation', link: 'docs/guide/getting-started.md' },
    ],
  },
  {
    text: 'API Reference',
    items: [
      { text: 'Overview', link: 'docs/api/overview.md' },
    ],
  },
];

// All pages for navigation
const ALL_PAGES: NavItem[] = [
  { path: 'docs/index.md', title: 'Welcome' },
  { path: 'docs/guide/getting-started.md', title: 'Installation' },
  { path: 'docs/api/overview.md', title: 'API Overview' },
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [sidebarItems] = useState<SidebarItem[]>(DEFAULT_SIDEBAR);

  useEffect(() => {
    // Try to get the markdown path from the URL hash or query
    const hash = window.location.hash.slice(1);
    const path = new URLSearchParams(window.location.search).get('path');
    
    if (hash) {
      setCurrentPath(hash);
    } else if (path) {
      setCurrentPath(path);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash) setCurrentPath(newHash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check if we're viewing markdown
  const isMarkdown = currentPath.length > 0;
  const mdPath = currentPath;

  return (
    <div class={`app ${isDarkMode ? 'dark' : 'light'}`} style={styles.app}>
      <nav style={{...styles.nav, backgroundColor: isDarkMode ? '#111111' : '#ffffff', borderColor: isDarkMode ? '#333333' : '#e1e4e8'}}>
        <div style={styles.navBrand}>
          <a href="#" style={{...styles.brandLink, color: '#0070f3'}} onClick={e => {
            e.preventDefault();
            window.location.hash = '';
            setCurrentPath('');
          }}>
            📚 JenPress
          </a>
        </div>
        <ul style={styles.navMenu}>
          <li>
            <a href="#docs/index.md" style={{...styles.link, color: '#0070f3'}}>Docs</a>
          </li>
          <li>
            <a href="#docs/guide/getting-started.md" style={{...styles.link, color: '#0070f3'}}>Guide</a>
          </li>
        </ul>
        <div style={styles.navRight}>
          <Search onSelect={(path) => {
            window.location.hash = path;
            setCurrentPath(path);
          }} />
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{...styles.themeToggle, color: isDarkMode ? '#ffffff' : '#000000'}}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <div style={styles.mainContainer}>
        <Sidebar items={sidebarItems} currentPath={mdPath} onNavigate={setCurrentPath} />
        <main style={styles.content}>
          {isMarkdown && mdPath ? (
            <Fragment>
              <Navigation currentPath={mdPath} allPages={ALL_PAGES} />
              <MarkdownPage path={mdPath} isDark={isDarkMode} />
            </Fragment>
          ) : (
            <WelcomePage />
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: '1.6',
    color: 'var(--fg)',
    backgroundColor: 'var(--bg)',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  } as any,
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  } as any,
  navBrand: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--fg)',
  } as any,
  brandLink: {
    color: '#0070f3',
    textDecoration: 'none',
  },
  navMenu: {
    display: 'flex',
    listStyle: 'none',
    gap: '2rem',
    margin: 0,
    flex: 1,
  } as any,
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  } as any,
  link: {
    color: '#0070f3',
    textDecoration: 'none',
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'color 0.3s ease',
  } as any,
  mainContainer: {
    display: 'flex',
    flex: 1,
    gap: '2rem',
    overflow: 'hidden',
  } as any,
  content: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
    height: 'calc(100vh - 60px)',
    minWidth: 0,
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
  } as any,
  contentWrapper: {
    display: 'flex',
    flex: 1,
    gap: '2rem',
    minWidth: 0,
  } as any,
  title: {
    fontSize: '2.5rem',
    margin: '0 0 0.5rem 0',
    color: 'var(--fg)',
  } as any,
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--fg-secondary)',
    marginBottom: '2rem',
  } as any,
  section: {
    marginBottom: '2rem',
  },
  list: {
    marginLeft: '1.5rem',
    marginBottom: '1rem',
  } as any,
  code: {
    backgroundColor: 'var(--code-bg)',
    padding: '1rem',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    color: 'var(--fg)',
    border: '1px solid var(--border)',
  } as any,
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: 'var(--fg-secondary)',
  } as any,
  breadcrumbLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  breadcrumbText: {
    color: 'var(--fg)',
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    color: 'var(--fg-tertiary)',
    marginTop: '-2px',
  },
  footer: {
    padding: '2rem 0',
    color: 'var(--fg-secondary)',
    fontSize: '0.9rem',
  } as any,
  editLink: {
    padding: '1.5rem 0',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    marginTop: '2rem',
    marginBottom: '1rem',
  } as any,
  mdContent: {
    margin: '2rem 0',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--fg-secondary)',
  } as any,
  error: {
    padding: '2rem',
    backgroundColor: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    color: 'var(--fg-secondary)',
  } as any,
};

// Handle copy buttons
document.addEventListener('click', (e) => {
  const button = (e.target as HTMLElement).closest('.code-block-copy');
  if (button instanceof HTMLButtonElement) {
    const code = button.getAttribute('data-code');
    if (code) {
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');
      
      navigator.clipboard.writeText(decodedCode).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = '<i class="bi bi-clipboard"></i>';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }
});

// Render app
const app = document.getElementById('app');
if (app) {
  render(h(App), app);
}
