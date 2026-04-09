import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Script } from '../components/script';

const meta: Meta<typeof Script> = {
  title: 'Components/Script',
  component: Script,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Script>;

export const ExternalSource: Story = {
  args: {
    src: 'https://example.com/analytic.js',
    strategy: 'lazyOnload',
  },
};

export const InlineScript: Story = {
  args: {
    id: 'analytics-id',
    children: 'console.log("Jen.js analytics initialized");',
  },
};
