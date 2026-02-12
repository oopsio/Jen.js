import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

export interface SearchResult {
  path: string;
  title: string;
  excerpt: string;
  content: string;
}

export interface SearchProps {
  onSelect: (path: string) => void;
}

export function Search({ onSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search index on mount
  useEffect(() => {
    loadSearchIndex();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Build search index from docs
  const loadSearchIndex = async () => {
    const docPaths = [
      'docs/index.md',
      'docs/guide/getting-started.md',
      'docs/api/overview.md',
    ];

    const indexData: SearchResult[] = [];

    for (const path of docPaths) {
      try {
        const content = await fetch(`/${path}`).then(r => r.text());
        
        // Extract title from frontmatter
        const titleMatch = content.match(/title:\s*(.+)/);
        const title = titleMatch ? titleMatch[1].trim() : path;
        
        // Extract body (after frontmatter)
        const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
        const body = bodyMatch ? bodyMatch[1] : content;
        
        // Create excerpt (first 150 chars)
        const plainText = body.replace(/[#\*`\[\]()]/g, '').trim();
        const excerpt = plainText.substring(0, 150).trim() + '...';
        
        indexData.push({
          path,
          title,
          excerpt,
          content: plainText.toLowerCase(),
        });
      } catch (e) {
        console.error(`Failed to index ${path}:`, e);
      }
    }

    setIndex(indexData);
  };

  // Search function
  const handleSearch = (q: string) => {
    setQuery(q);

    if (!q.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = q.toLowerCase();
    const filtered = index.filter(
      item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.includes(lowerQuery)
    );

    setResults(filtered.slice(0, 5)); // Limit to 5 results
  };

  const handleSelectResult = (path: string) => {
    onSelect(path);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.searchButton}
        onClick={() => setIsOpen(true)}
        title="Press / to search"
      >
        🔍
      </button>

      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)}>
          <div style={styles.dialog} onClick={e => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search documentation... (Press / to focus)"
              value={query}
              onInput={e => handleSearch((e.target as HTMLInputElement).value)}
              style={styles.input}
              autoFocus
            />

            {results.length > 0 && (
              <ul style={styles.results}>
                {results.map(result => (
                  <li
                    key={result.path}
                    style={styles.resultItem}
                    onClick={() => handleSelectResult(result.path)}
                  >
                    <div style={styles.resultTitle}>{result.title}</div>
                    <div style={styles.resultExcerpt}>{result.excerpt}</div>
                  </li>
                ))}
              </ul>
            )}

            {query && results.length === 0 && (
              <div style={styles.noResults}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
  },
  searchButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '100px',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    padding: '1rem',
    border: 'none',
    fontSize: '1rem',
    fontFamily: 'Geist, sans-serif',
    outline: 'none',
  },
  results: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  resultItem: {
    padding: '1rem',
    borderTop: '1px solid #eee',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  resultTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.25rem',
  },
  resultExcerpt: {
    fontSize: '0.875rem',
    color: '#666',
    lineHeight: '1.4',
  },
  noResults: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#999',
  },
};
