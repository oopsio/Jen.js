---
title: Component Guide
description: Custom UI components with markdown syntax
---

# Component Guide

JenPress supports custom UI components using simple markdown-like syntax. Just write HTML tags in your markdown and they'll be rendered as interactive components.

## Buttons

<Button variant="default">Click me</Button>

<Button variant="outline">Outline Button</Button>

<Button variant="ghost">Ghost Button</Button>

<Button variant="destructive">Delete</Button>

<Button size="sm">Small</Button>

<Button size="lg">Large</Button>

<Button href="https://example.com">Link Button</Button>

## Cards

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    This is the card content. You can put any markdown here including **bold**, *italic*, and `code`.
  </CardContent>
</Card>

## Alerts

<Alert variant="default">
  This is a default alert message.
</Alert>

<Alert variant="success">
  Success! Your action completed.
</Alert>

<Alert variant="warning">
  Warning! Be careful with this action.
</Alert>

<Alert variant="destructive">
  Error! Something went wrong.
</Alert>

## Badges

Use badges for labels and tags:

<Badge variant="default">New</Badge>
<Badge variant="secondary">Coming Soon</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="destructive">Critical</Badge>

## Callouts

<Callout type="note" title="Note">
  This is a note callout with additional information.
</Callout>

<Callout type="tip" title="Pro Tip">
  Here's a helpful tip to improve your workflow.
</Callout>

<Callout type="warning" title="Warning">
  Be careful! This action has important consequences.
</Callout>

<Callout type="danger" title="Danger">
  This operation cannot be undone.
</Callout>

<Callout type="info" title="Info">
  Here's some additional information you should know.
</Callout>

## Tabs

<Tabs defaultvalue="tab-1">
  <TabList>
    <TabTrigger value="tab-1">JavaScript</TabTrigger>
    <TabTrigger value="tab-2">Python</TabTrigger>
    <TabTrigger value="tab-3">Go</TabTrigger>
  </TabList>
  
  <TabContent value="tab-1">
    ```js
    const greeting = "Hello from JavaScript!";
    console.log(greeting);
    ```
  </TabContent>
  
  <TabContent value="tab-2">
    ```python
    greeting = "Hello from Python!"
    print(greeting)
    ```
  </TabContent>
  
  <TabContent value="tab-3">
    ```go
    package main
    
    import "fmt"
    
    func main() {
      fmt.Println("Hello from Go!")
    }
    ```
  </TabContent>
</Tabs>

## Accordions

<Accordion type="single">
  <AccordionItem value="item-1">
    <AccordionTrigger>What is JenPress?</AccordionTrigger>
    <AccordionContent>
      JenPress is a modern documentation site generator built with Preact and Vite, featuring insane speed, clean default theme, and markdown-first approach.
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="item-2">
    <AccordionTrigger>How do I create a new page?</AccordionTrigger>
    <AccordionContent>
      Simply create a new `.md` file in your `docs/` directory and add it to your sidebar configuration. The routing is file-based.
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="item-3">
    <AccordionTrigger>Can I use custom components?</AccordionTrigger>
    <AccordionContent>
      Yes! JenPress provides built-in components like Button, Card, Alert, Tabs, and Accordion. Just use HTML-like syntax in your markdown.
    </AccordionContent>
  </AccordionItem>
</Accordion>

## Component Syntax

All components use standard HTML tag syntax in markdown:

```
<ComponentName prop="value" prop2="value2">
  Content goes here
</ComponentName>
```

### Supported Props

| Component | Props | Examples |
|-----------|-------|----------|
| Button | `variant`, `size`, `href`, `disabled` | `<Button variant="outline" size="lg">Click</Button>` |
| Card | - | `<Card>content</Card>` |
| Alert | `variant` | `<Alert variant="success">Message</Alert>` |
| Badge | `variant` | `<Badge variant="destructive">Critical</Badge>` |
| Tabs | `defaultvalue` | `<Tabs defaultvalue="tab-1">...</Tabs>` |
| TabTrigger | `value` | `<TabTrigger value="tab-1">Label</TabTrigger>` |
| TabContent | `value` | `<TabContent value="tab-1">content</TabContent>` |
| Accordion | `type` | `<Accordion type="single">...</Accordion>` |
| AccordionItem | `value` | `<AccordionItem value="item-1">...</AccordionItem>` |
| Callout | `type`, `title` | `<Callout type="tip" title="Hint">content</Callout>` |

## Color Variants

### Button Variants
- `default` - Blue primary
- `outline` - Border only
- `ghost` - No background
- `destructive` - Red warning

### Alert Variants
- `default` - Blue info
- `success` - Green
- `warning` - Amber/Yellow
- `destructive` - Red error

### Badge Variants
- `default` - Blue
- `secondary` - Grey
- `success` - Green
- `destructive` - Red

## Nesting Components

Components support nesting other components and markdown formatting:

<Card>
  <CardHeader>
    <CardTitle>Advanced Example</CardTitle>
  </CardHeader>
  <CardContent>
    <Alert variant="info">
      You can nest components and use **markdown formatting** inside them.
    </Alert>
    
    <Button variant="outline">Action Button</Button>
  </CardContent>
</Card>

## Best Practices

1. **Keep it readable** - Format components clearly with proper indentation
2. **Use semantic components** - Choose components that match the content type
3. **Limit nesting** - 2-3 levels deep works best
4. **Accessible** - Components include proper ARIA labels
5. **Responsive** - All components are mobile-friendly by default
