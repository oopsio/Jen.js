import type { Meta, StoryObj } from '@storybook/preact-vite';
import { DevToolsUI } from '../devtools/ui';

const meta: Meta<typeof DevToolsUI> = {
  title: 'DevTools/Retro',
  component: DevToolsUI,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DevToolsUI>;

export const Default: Story = {
  args: {
    wsUrl: 'ws://localhost:3001',
  },
};
