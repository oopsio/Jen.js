/**
 * Custom UI Components for Markdown
 * Fumadocs/shadcn/ui style components with custom syntax
 */

export interface ComponentProps {
  [key: string]: string | boolean | undefined;
}

export interface ComponentDef {
  name: string;
  render: (props: ComponentProps, content: string) => string;
}

// Button Component
const Button: ComponentDef = {
  name: 'Button',
  render: (props, content) => {
    const variant = props.variant || 'default';
    const size = props.size || 'md';
    const disabled = props.disabled === 'true' || props.disabled === true;
    const href = props.href;
    
    const variantClass = {
      default: 'bg-[#0070f3] text-white hover:bg-[#0051b3]',
      outline: 'border border-[#0070f3] text-[#0070f3] hover:bg-[#f0f4ff]',
      ghost: 'text-[#0070f3] hover:bg-[#f0f4ff]',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
    }[variant] || '';
    
    const sizeClass = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }[size] || '';
    
    const baseClass = `inline-flex items-center justify-center rounded-md font-medium transition-colors ${variantClass} ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
    
    if (href) {
      return `<a href="${href}" class="${baseClass}">${content}</a>`;
    }
    
    return `<button class="${baseClass}" ${disabled ? 'disabled' : ''}>${content}</button>`;
  },
};

// Card Component
const Card: ComponentDef = {
  name: 'Card',
  render: (props, content) => {
    return `<div class="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg)]">
      ${content}
    </div>`;
  },
};

// CardHeader Component
const CardHeader: ComponentDef = {
  name: 'CardHeader',
  render: (props, content) => {
    return `<div class="px-6 py-4 border-b border-[var(--border)]">
      ${content}
    </div>`;
  },
};

// CardTitle Component
const CardTitle: ComponentDef = {
  name: 'CardTitle',
  render: (props, content) => {
    return `<h3 class="text-lg font-semibold text-[var(--fg)]">${content}</h3>`;
  },
};

// CardContent Component
const CardContent: ComponentDef = {
  name: 'CardContent',
  render: (props, content) => {
    return `<div class="px-6 py-4 text-[var(--fg)]">
      ${content}
    </div>`;
  },
};

// Alert Component
const Alert: ComponentDef = {
  name: 'Alert',
  render: (props, content) => {
    const variant = props.variant || 'default';
    
    const variantClasses = {
      default: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100',
      success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100',
      warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-100',
      destructive: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100',
    }[variant] || '';
    
    return `<div class="border rounded-lg px-4 py-3 ${variantClasses}">
      ${content}
    </div>`;
  },
};

// Tabs Component
const Tabs: ComponentDef = {
  name: 'Tabs',
  render: (props, content) => {
    const defaultValue = props.defaultvalue || 'tab-0';
    return `<div class="tabs-wrapper" data-default="${defaultValue}">
      ${content}
    </div>`;
  },
};

// TabList Component
const TabList: ComponentDef = {
  name: 'TabList',
  render: (props, content) => {
    return `<div class="flex border-b border-[var(--border)] gap-2">
      ${content}
    </div>`;
  },
};

// TabTrigger Component
const TabTrigger: ComponentDef = {
  name: 'TabTrigger',
  render: (props, content) => {
    const value = props.value || 'tab-0';
    return `<button class="tab-trigger px-4 py-2 text-[var(--fg)] border-b-2 border-transparent hover:border-[var(--border)] transition-colors data-active:border-[#0070f3]" data-value="${value}">
      ${content}
    </button>`;
  },
};

// TabContent Component
const TabContent: ComponentDef = {
  name: 'TabContent',
  render: (props, content) => {
    const value = props.value || 'tab-0';
    return `<div class="tab-content py-4 hidden data-active:block" data-value="${value}">
      ${content}
    </div>`;
  },
};

// Accordion Component
const Accordion: ComponentDef = {
  name: 'Accordion',
  render: (props, content) => {
    const type = props.type || 'single';
    return `<div class="accordion-wrapper space-y-2" data-type="${type}">
      ${content}
    </div>`;
  },
};

// AccordionItem Component
const AccordionItem: ComponentDef = {
  name: 'AccordionItem',
  render: (props, content) => {
    const value = props.value || 'item-0';
    return `<div class="accordion-item border border-[var(--border)] rounded-lg overflow-hidden" data-value="${value}">
      ${content}
    </div>`;
  },
};

// AccordionTrigger Component
const AccordionTrigger: ComponentDef = {
  name: 'AccordionTrigger',
  render: (props, content) => {
    return `<button class="accordion-trigger w-full px-4 py-3 flex items-center justify-between bg-[var(--border-light)] hover:bg-[var(--code-bg)] transition-colors text-[var(--fg)] font-medium">
      ${content}
      <i class="bi bi-chevron-down transition-transform"></i>
    </button>`;
  },
};

// AccordionContent Component
const AccordionContent: ComponentDef = {
  name: 'AccordionContent',
  render: (props, content) => {
    return `<div class="accordion-content hidden px-4 py-3 border-t border-[var(--border)] text-[var(--fg)]">
      ${content}
    </div>`;
  },
};

// Badge Component
const Badge: ComponentDef = {
  name: 'Badge',
  render: (props, content) => {
    const variant = props.variant || 'default';
    
    const variantClass = {
      default: 'bg-[#0070f3] text-white',
      secondary: 'bg-[var(--border-light)] text-[var(--fg)]',
      destructive: 'bg-red-500 text-white',
      success: 'bg-green-500 text-white',
    }[variant] || '';
    
    return `<span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${variantClass}">
      ${content}
    </span>`;
  },
};

// Callout Component (custom wrapper)
const Callout: ComponentDef = {
  name: 'Callout',
  render: (props, content) => {
    const type = props.type || 'info';
    const title = props.title || type.toUpperCase();
    
    const iconMap = {
      note: '<i class="bi bi-info-circle"></i>',
      info: '<i class="bi bi-info-circle-fill"></i>',
      warning: '<i class="bi bi-exclamation-triangle"></i>',
      danger: '<i class="bi bi-exclamation-octagon"></i>',
      tip: '<i class="bi bi-lightbulb"></i>',
    };
    
    const icon = iconMap[type as keyof typeof iconMap] || '<i class="bi bi-info-circle"></i>';
    
    return `<div class="callout callout-${type}">
      <div class="callout-header">
        <span class="callout-icon">${icon}</span>
        <span class="callout-title">${title}</span>
      </div>
      <div class="callout-content">${content}</div>
    </div>`;
  },
};

export const COMPONENTS: Record<string, ComponentDef> = {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Badge,
  Callout,
};

export function parseComponentTag(html: string): { tag: string; props: ComponentProps; content: string; rest: string } | null {
  // Match opening tag: <ComponentName prop="value" prop2="value2">content</ComponentName>
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/;
  const match = html.match(tagRegex);
  
  if (!match) return null;
  
  const tag = match[1];
  const propsStr = match[2];
  const content = match[3];
  const rest = html.slice(match[0].length);
  
  // Parse props
  const props: ComponentProps = {};
  const propRegex = /(\w+)="([^"]*)"/g;
  let propMatch;
  while ((propMatch = propRegex.exec(propsStr)) !== null) {
    props[propMatch[1].toLowerCase()] = propMatch[2];
  }
  
  return { tag, props, content, rest };
}

export function renderComponent(tag: string, props: ComponentProps, content: string): string {
  const component = COMPONENTS[tag];
  if (!component) {
    console.warn(`Unknown component: ${tag}`);
    return `<div class="text-red-500">Unknown component: ${tag}</div>`;
  }
  
  return component.render(props, content);
}
