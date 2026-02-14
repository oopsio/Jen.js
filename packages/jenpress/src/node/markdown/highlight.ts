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
