import type { Meta, StoryObj } from '@storybook/preact-vite';
import { DevToolsPanel } from '../devtools/ui-vercel';

const meta: Meta<typeof DevToolsPanel> = {
  title: 'DevTools/Vercel',
  component: DevToolsPanel,
};

export default meta;
type Story = StoryObj<typeof DevToolsPanel>;

export const Default: Story = {
  args: {},
};
