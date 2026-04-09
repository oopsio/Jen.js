import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { h } from 'preact';
import renderToString from 'preact-render-to-string';
import { PartialRegistry } from '../partials.js';
import { Partial } from '../../components/partial.js';

describe('Jen.js Partials', () => {
  beforeEach(() => {
    PartialRegistry.clear();
  });

  afterEach(() => {
    PartialRegistry.clear();
  });

  it('should register and retrieve a partial', () => {
    const TestComponent = () => h('div', { class: 'test' }, 'Test');
    PartialRegistry.register('test', TestComponent);

    const retrieved = PartialRegistry.get('test');
    expect(retrieved).toBeDefined();
    expect(retrieved).toBe(TestComponent);
  });

  it('should render a registered partial using the <Partial> component', () => {
    const Card = ({ title }: { title: string }) =>
      h('div', { class: 'card' }, h('h1', null, title));
    PartialRegistry.register('card', Card);

    const rendered = renderToString(
      h(Partial, { name: 'card', title: 'Hello World' }),
    );
    expect(rendered).toContain('class="card"');
    expect(rendered).toContain('<h1>Hello World</h1>');
  });

  it('should throw an error when rendering an missing partial', () => {
    expect(() => {
      renderToString(h(Partial, { name: 'missing' }));
    }).toThrow(/Partial "missing" not found/);
  });

  it('should support nested partials', () => {
    const Layout = ({ children }: any) =>
      h(
        'div',
        { class: 'layout' },
        h(Partial, { name: 'header' }),
        children,
        h(Partial, { name: 'footer' }),
      );
    const Header = () => h('header', null, 'Header');
    const Footer = () => h('footer', null, 'Footer');

    PartialRegistry.register('layout', Layout);
    PartialRegistry.register('header', Header);
    PartialRegistry.register('footer', Footer);

    const rendered = renderToString(
      h(Partial, { name: 'layout' }, h('p', null, 'Content')),
    );
    expect(rendered).toContain('<div class="layout">');
    expect(rendered).toContain('<header>Header</header>');
    expect(rendered).toContain('<p>Content</p>');
    expect(rendered).toContain('<footer>Footer</footer>');
  });

  it('should register partials via registerGlob', () => {
    const c1 = () => h('div', null, '1');
    const c2 = () => h('div', null, '2');

    const globResult = {
      '/partials/One.tsx': { default: c1 },
      '/partials/Nested/Two.jsx': { default: c2 },
      '/partials/NoDefault.ts': { somethingElse: true },
    };

    PartialRegistry.registerGlob(globResult);

    expect(PartialRegistry.get('One')).toBe(c1);
    expect(PartialRegistry.get('Two')).toBe(c2);
    expect(PartialRegistry.get('NoDefault')).toBeUndefined();
  });
});
