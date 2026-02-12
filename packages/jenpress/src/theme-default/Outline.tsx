import { h } from 'preact';
import type { PageData } from '../node/config.js';

export interface OutlineProps {
  page: PageData;
}

export function Outline({ page }: OutlineProps) {
  // Extract headings from content using regex
  const headingRegex = /<h([2-3]) id="([^"]*)"[^>]*>([^<]+)<\/h\1>/g;
  const headings: Array<{ level: number; id: string; text: string }> = [];
  let match;

  while ((match = headingRegex.exec(page.content)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''), // Remove HTML tags
    });
  }

  if (!headings.length) {
    return null;
  }

  return (
    <aside class="jenpress-outline">
      <h4>On this page</h4>
      <ul class="outline-list">
        {headings.map(heading => (
          <li
            key={heading.id}
            class={`outline-item level-${heading.level}`}
            style={{ marginLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
