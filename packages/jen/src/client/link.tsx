import { ComponentChildren, JSX } from 'preact';

export interface LinkProps {
  href: string;
  children: ComponentChildren;
  className?: string;
  style?: JSX.CSSProperties;
}

export function Link({ href, children, className, style }: LinkProps) {
  const handleClick = (e: MouseEvent) => {
    // Only intercept normal left clicks without modifier keys
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();

    // Avoid redundant navigation
    if (window.location.pathname === href) return;

    // Update URL
    window.history.pushState({}, '', href);

    // Notify the router
    const navEvent = new CustomEvent('jen-navigation', { detail: { href } });
    window.dispatchEvent(navEvent);
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
