import { defineConfig } from './src/index.js';

export default defineConfig({
  title: 'JenPress Example',
  description: 'Example documentation site built with JenPress',
  base: '/',
  
  themeConfig: {
    logo: 'https://via.placeholder.com/32',
    repo: 'https://github.com/kessud2021/Jen.js',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Welcome', link: '/' },
          { text: 'Guide', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/overview' },
        ],
      },
    ],
  },
  
  markdown: {
    lineNumbers: true,
    breaks: false,
    typographer: true,
  },
});
