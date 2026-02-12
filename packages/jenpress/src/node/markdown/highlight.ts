export function highlightSync(code: string, lang: string = 'text'): string {
  // Fallback to plain code highlighting (sync version for markdown-it)
  // For production, use async highlight in a pre-processing step
  return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
}

export async function highlight(code: string, lang: string = 'text'): Promise<string> {
  try {
    // Try to use Shiki if available
    const { codeToHtml } = await import('shiki');
    const html = await codeToHtml(code, {
      lang: lang || 'text',
      theme: 'github-light',
    });
    return html;
  } catch (error) {
    // Fallback to plain code if highlighting fails
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
