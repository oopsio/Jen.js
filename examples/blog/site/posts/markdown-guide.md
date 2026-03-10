---
title: Markdown Guide
date: 2026-02-20
author: Sarah Chen
excerpt: Complete guide to writing content in Markdown for your blog
---

# Markdown Guide

Markdown is a lightweight markup language that's perfect for writing content. This guide covers all the essentials.

## Text Formatting

You can make text **bold** using `**text**` or _italic_ using `*text*`.

You can also combine them: **_bold and italic_**.

~~Strikethrough text~~ uses `~~text~~`.

## Headings

```markdown
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
```

## Lists

### Unordered Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered Lists

1. First item
2. Second item
   1. Nested ordered item
   2. Another nested item
3. Third item

## Code

Inline code uses backticks: `const x = 42`

Code blocks use triple backticks:

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## Blockquotes

> This is a blockquote. It can span multiple lines
> and contains important information.

## Links and Images

[Link text](https://example.com)

![Alt text](https://via.placeholder.com/150)

## Tables

| Feature | Jen.js | Next.js | Astro |
| ------- | ------ | ------- | ----- |
| Speed   | ⚡     | ⚡      | ⚡    |
| SSR     | ✓      | ✓       | ✓     |
| Islands | ✓      | ✗       | ✓     |

## Horizontal Rules

---

Above is a horizontal rule created with `---`

## Escaping

Use backslash to escape special characters: \*not italic\*

## Pro Tips

1. Keep lines under 80 characters for readability
2. Use consistent heading levels
3. Add plenty of whitespace for readability
4. Prefer unordered lists for non-sequential items
5. Use code blocks for technical content

Now you're ready to write amazing content! ✍️
