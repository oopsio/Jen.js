import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Partial } from '../components/partial';

const meta: Meta<typeof Partial> = {
  title: 'Components/Partial',
  component: Partial,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Partial>;

export const Default: Story = {
  args: {
    name: 'header',
    placeholder: 'Loading header...',
  },
};

export const WithProps: Story = {
  args: {
    name: 'user-profile',
    props: {
      userId: 123,
      theme: 'dark'
    },
  },
};
