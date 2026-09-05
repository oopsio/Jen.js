import type { Meta, StoryObj } from '@storybook/preact-vite';
import { GoogleFont } from '../fonts/google';

const GoogleFontDemo = ({ fontName, text }: { fontName: string, text: string }) => {
  const font = GoogleFont(fontName, { weight: [400, 700], subsets: ['latin'] });
  
  return (
    <div style={font.style}>
      <link rel="stylesheet" href={font.href} />
      <h1 className={font.className}>Testing {fontName}</h1>
      <p>This is a preview of the font optimized by Jen.js.</p>
      <p>{text}</p>
      <hr />
      <pre>{JSON.stringify(font, null, 2)}</pre>
    </div>
  );
};

const meta: Meta<typeof GoogleFontDemo> = {
  title: 'Fonts/GoogleFont',
  component: GoogleFontDemo,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GoogleFontDemo>;

export const Inter: Story = {
  args: {
    fontName: 'Inter',
    text: 'The quick brown fox jumps over the lazy dog.',
  },
};

export const RobotoMono: Story = {
  args: {
    fontName: 'Roboto Mono',
    text: 'const x = 42;',
  },
};

export const PlayfairDisplay: Story = {
  args: {
    fontName: 'Playfair Display',
    text: 'A more elegant font for titles.',
  },
};
