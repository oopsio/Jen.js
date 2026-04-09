import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Link } from '../client/link';

const meta: Meta<typeof Link> = {
  title: 'Client/Link',
  component: Link,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: '/about',
    children: 'Go to About page',
  },
};

export const External: Story = {
  args: {
    href: 'https://google.com',
    children: 'External Google Link',
  },
};

export const CustomStyling: Story = {
  args: {
    href: '/',
    children: 'Home Button',
    className: 'px-4 py-2 bg-blue-500 text-white rounded',
  },
};
