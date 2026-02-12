import { h } from 'preact';
import { useState } from 'preact/hooks';

export interface NavProps {
  config: any;
}

export function Nav({ config }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav class="jenpress-nav">
      <div class="nav-container">
        <div class="nav-brand">
          {config.logo && <img src={config.logo} alt="logo" class="nav-logo" />}
          <a href="/">{config.title}</a>
        </div>

        <button
          class="nav-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul class={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {config.themeConfig?.nav?.map((link: any) => (
            <li key={link.link}>
              <a href={link.link} class="nav-link">
                {link.text}
              </a>
            </li>
          ))}
          {config.themeConfig?.repo && (
            <li>
              <a href={config.themeConfig.repo} class="nav-link" target="_blank">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
