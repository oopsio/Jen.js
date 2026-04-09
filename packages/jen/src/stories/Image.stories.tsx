import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Image } from '../components/image';

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'select',
      options: ['lazy', 'eager'],
    },
    quality: {
      control: { type: 'range', min: 1, max: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    alt: 'Sample Image',
    width: 300,
    height: 300,
  },
};

export const Optimized: Story = {
  args: {
    src: '/logo.png',
    alt: 'Optimized internal image',
    width: 200,
    quality: 90,
  },
};
