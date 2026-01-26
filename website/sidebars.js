// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started',
        'installation',
        'project-structure',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'routing',
        'ssg-ssr',
        'components',
        'data-loading',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'api',
        'database',
        'auth',
        'middleware',
        'cache',
        'plugins',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'build',
        'deployment',
        'native-modules',
        'performance',
      ],
    },
  ],
};

export default sidebars;
