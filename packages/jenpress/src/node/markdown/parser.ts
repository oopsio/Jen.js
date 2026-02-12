import MarkdownIt from 'markdown-it';
import { highlightSync } from './highlight.js';

export interface ParsedMarkdown {
  html: string;
  frontmatter: Record<string, any>;
  metadata: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: highlightSync,
});

// Add table support
import markdownItTable from 'markdown-it-table-of-contents';
try {
  md.use(markdownItTable);
} catch (e) {
  // Table support not available
}

// Custom rule for component syntax
md.inline.ruler.push('component', (state, silent) => {
  const max = state.posMax;
  const pos = state.pos;

  if (pos + 2 > max) return false;
  if (state.src[pos] !== '<') return false;

  const match = state.src.slice(pos).match(/^<([A-Z][a-zA-Z0-9]*)\s*\/>/);
  if (!match) return false;

  if (!silent) {
    const token = state.push('component', 'div', 0);
    token.meta = { componentName: match[1] };
    token.content = match[0];
  }

  state.pos += match[0].length;
  return true;
});

// Custom rule for callouts/admonitions (> [!NOTE], > [!WARNING], etc.)
md.block.ruler.before('blockquote', 'callout', (state, startLine, endLine, silent) => {
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];

  if (pos + 2 > max) return false;
  if (state.src[pos] !== '>') return false;
  if (state.src[pos + 1] !== ' ') return false;

  const text = state.src.slice(pos + 2, max);
  const calloutMatch = text.match(/^\[!([A-Z]+)\]\s*(.*)/);
  if (!calloutMatch) return false;

  if (silent) return true;

  const calloutType = calloutMatch[1].toLowerCase();
  const calloutTitle = calloutMatch[2] || calloutType.toUpperCase();
  
  let nextLine = startLine + 1;
  const calloutLines: string[] = [calloutMatch[2] || ''];

  // Collect all subsequent blockquote lines
  while (nextLine < endLine) {
    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
    const max = state.eMarks[nextLine];

    if (pos + 2 > max) break;
    if (state.src[pos] !== '>') break;
    if (state.src[pos + 1] !== ' ') break;

    calloutLines.push(state.src.slice(pos + 2, max));
    nextLine++;
  }

  const token = state.push('callout_open', 'div', 1);
  token.meta = { type: calloutType, title: calloutTitle };
  token.attrSet('class', `callout callout-${calloutType}`);
  token.markup = '>';

  const tokenContent = state.push('inline', '', 0);
  tokenContent.content = calloutLines.join('\n');

  state.push('callout_close', 'div', -1);

  state.line = nextLine;
  return true;
});

// Custom renderers for callouts
md.renderer.rules['callout_open'] = (tokens, idx) => {
  const token = tokens[idx];
  const type = token.meta?.type || 'note';
  const title = token.meta?.title || type.toUpperCase();
  const icons: Record<string, string> = {
    note: '📝',
    warning: '⚠️',
    tip: '💡',
    danger: '🚨',
    info: 'ℹ️',
  };
  const icon = icons[type] || '📝';
  return `<div class="callout callout-${type}"><div class="callout-header"><span class="callout-icon">${icon}</span><span class="callout-title">${title}</span></div><div class="callout-content">`;
};

md.renderer.rules['callout_close'] = () => {
  return '</div></div>';
};

export function parseMarkdown(content: string): ParsedMarkdown {
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  let frontmatter: Record<string, any> = {};
  let bodyContent = content;

  if (frontmatterMatch) {
    bodyContent = content.slice(frontmatterMatch[0].length);
    frontmatter = parseFrontmatter(frontmatterMatch[1]);
  }

  // Parse markdown
  const html = md.render(bodyContent);

  return {
    html,
    frontmatter,
    metadata: {
      title: frontmatter.title || 'Untitled',
      description: frontmatter.description,
      ...frontmatter,
    },
  };
}

function parseFrontmatter(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value: any = match[2].trim();

      // Simple type conversion
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        value = JSON.parse(value);
      }

      result[key] = value;
    }
  }

  return result;
}
