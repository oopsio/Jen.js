import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const gitConfig = {
  user: 'oopsio',
  repo: 'jen.js',
  branch: 'main/docs',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Jen.js',
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
