/**
 * Client-side syntax highlighting with Shiki
 */

let highlighter: any = null;
let highlighterPromise: Promise<any> | null = null;

async function getHighlighter() {
  if (highlighter) return highlighter;
  
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    try {
      const { codeToHtml } = await import('shiki');
      return { codeToHtml };
    } catch (error) {
      console.warn('Shiki not available, using fallback highlighting');
      return null;
    }
  })();

  highlighter = await highlighterPromise;
  return highlighter;
}

const LANGUAGE_ICONS: Record<string, string> = {
  js: '<i class="bi bi-filetype-js"></i>',
  javascript: '<i class="bi bi-filetype-js"></i>',
  ts: '<i class="bi bi-filetype-ts"></i>',
  typescript: '<i class="bi bi-filetype-ts"></i>',
  jsx: '<i class="bi bi-filetype-jsx"></i>',
  tsx: '<i class="bi bi-filetype-tsx"></i>',
  py: '<i class="bi bi-filetype-py"></i>',
  python: '<i class="bi bi-filetype-py"></i>',
  json: '<i class="bi bi-filetype-json"></i>',
  html: '<i class="bi bi-filetype-html"></i>',
  css: '<i class="bi bi-filetype-css"></i>',
  bash: '<i class="bi bi-terminal"></i>',
  sh: '<i class="bi bi-terminal"></i>',
  shell: '<i class="bi bi-terminal"></i>',
  go: '<i class="bi bi-filetype-go"></i>',
  rust: '<i class="bi bi-filetype-rs"></i>',
  java: '<i class="bi bi-filetype-java"></i>',
  cpp: '<i class="bi bi-filetype-cpp"></i>',
  c: '<i class="bi bi-filetype-c"></i>',
  csharp: '<i class="bi bi-filetype-cs"></i>',
  php: '<i class="bi bi-filetype-php"></i>',
  ruby: '<i class="bi bi-filetype-rb"></i>',
  sql: '<i class="bi bi-database"></i>',
  xml: '<i class="bi bi-filetype-xml"></i>',
  yaml: '<i class="bi bi-filetype-yml"></i>',
  markdown: '<i class="bi bi-filetype-md"></i>',
  md: '<i class="bi bi-filetype-md"></i>',
  text: '<i class="bi bi-file-text"></i>',
};

export async function highlightCode(code: string, lang: string = 'text', isDark: boolean = false): Promise<string> {
  const hl = await getHighlighter();
  
  if (!hl) {
    // Fallback: plain code with HTML escaping
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  }

  try {
    const highlighted = await hl.codeToHtml(code, {
      lang: lang || 'text',
      theme: isDark ? 'github-dark' : 'github-light',
    });
    
    const icon = LANGUAGE_ICONS[lang.toLowerCase()] || '<i class="bi bi-file-text"></i>';
    const langDisplay = lang || 'text';
    
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-block-lang"><span class="code-block-icon">${icon}</span>${langDisplay}</span>
        <button class="code-block-copy" data-code="${escapeHtml(code)}" aria-label="Copy code"><i class="bi bi-clipboard"></i></button>
      </div>
      ${highlighted}
    </div>`;
  } catch (error) {
    console.warn(`Failed to highlight ${lang} code:`, error);
    return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
  }
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

export function escapeHtmlSync(text: string): string {
  return escapeHtml(text);
}
