import { readFileSync } from 'fs';
import { parseMarkdown } from './parser.js';

export async function transformMarkdownFile(filePath: string): Promise<string> {
  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseMarkdown(content);

  // Generate Preact component module
  const componentCode = `
import { h, Fragment } from 'preact';

export const metadata = ${JSON.stringify(parsed.metadata)};

export default function Page(props) {
  return h(Fragment, null,
    h('div', { className: 'md-content', dangerouslySetInnerHTML: { __html: ${JSON.stringify(parsed.html)} } })
  );
}
`;

  return componentCode;
}
