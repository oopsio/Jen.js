// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Jen.js',
  tagline: 'TypeScript-first framework for building static-generated and server-rendered web applications',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://jen-js.dev',
  baseUrl: '/',

  organizationName: 'kessud2021',
  projectName: 'Jen.js',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/kessud2021/Jen.js/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/kessud2021/Jen.js/tree/main/website/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/jen-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Jen.js',
        logo: {
          alt: 'Jen.js Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/kessud2021/Jen.js',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'Routing',
                to: '/docs/routing',
              },
              {
                label: 'SSG vs SSR',
                to: '/docs/ssg-ssr',
              },
            ],
          },
          {
            title: 'Features',
            items: [
              {
                label: 'Database',
                to: '/docs/database',
              },
              {
                label: 'Authentication',
                to: '/docs/auth',
              },
              {
                label: 'API Routes',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/kessud2021/Jen.js',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Jen.js. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['typescript', 'bash'],
      },
    }),
};

export default config;
