import { h, Fragment } from 'preact';

// Button component (shadcn/ui inspired)
export interface ButtonProps {
  children: any;
  onClick?: (e: MouseEvent) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  href?: string;
  target?: string;
  style?: Record<string, any>;
  class?: string;
}

export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  href,
  target,
  style = {},
  class: className = '',
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    borderRadius: '6px',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1,
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 0.875rem', fontSize: '0.875rem' },
    md: { padding: '0.625rem 1rem', fontSize: '1rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1.0625rem' },
  };

  const variantStyles = {
    default: {
      backgroundColor: '#0070f3',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#0070f3',
      border: '1px solid #0070f3',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#0070f3',
    },
    destructive: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
  };

  const combinedStyle = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={combinedStyle}
        class={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={combinedStyle}
      class={className}
    >
      {children}
    </button>
  );
}

// Card component (shadcn/ui inspired)
export interface CardProps {
  children: any;
  style?: Record<string, any>;
  class?: string;
}

export function Card({ children, style = {}, class: className = '' }: CardProps) {
  const cardStyle = {
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--code-bg)',
    padding: '1.5rem',
    ...style,
  };

  return (
    <div style={cardStyle} class={className}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: any;
  style?: Record<string, any>;
}

export function CardHeader({ children, style = {} }: CardHeaderProps) {
  return (
    <div style={{ marginBottom: '1rem', ...style }}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: any;
  style?: Record<string, any>;
}

export function CardTitle({ children, style = {} }: CardTitleProps) {
  return (
    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--fg)', ...style }}>
      {children}
    </h3>
  );
}

export interface CardDescriptionProps {
  children: any;
  style?: Record<string, any>;
}

export function CardDescription({ children, style = {} }: CardDescriptionProps) {
  return (
    <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--fg-secondary)', ...style }}>
      {children}
    </p>
  );
}

export interface CardContentProps {
  children: any;
  style?: Record<string, any>;
}

export function CardContent({ children, style = {} }: CardContentProps) {
  return (
    <div style={style}>
      {children}
    </div>
  );
}

// Alert component (shadcn/ui inspired)
export interface AlertProps {
  children: any;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  style?: Record<string, any>;
  class?: string;
}

export function Alert({
  children,
  variant = 'default',
  style = {},
  class: className = '',
}: AlertProps) {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--code-bg)',
      borderColor: 'var(--border)',
      color: 'var(--fg)',
    },
    destructive: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#ef4444',
      color: '#ef4444',
    },
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#f59e0b',
      color: '#d97706',
    },
    info: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      color: '#1e40af',
    },
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
      color: '#065f46',
    },
  };

  const alertStyle = {
    borderRadius: '6px',
    border: '1px solid',
    padding: '1rem',
    marginBottom: '1rem',
    ...variantStyles[variant],
    ...style,
  };

  return (
    <div style={alertStyle} class={className}>
      {children}
    </div>
  );
}

export interface AlertTitleProps {
  children: any;
  style?: Record<string, any>;
}

export function AlertTitle({ children, style = {} }: AlertTitleProps) {
  return (
    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600', ...style }}>
      {children}
    </h4>
  );
}

export interface AlertDescriptionProps {
  children: any;
  style?: Record<string, any>;
}

export function AlertDescription({ children, style = {} }: AlertDescriptionProps) {
  return (
    <p style={{ margin: '0', fontSize: '0.9rem', ...style }}>
      {children}
    </p>
  );
}
