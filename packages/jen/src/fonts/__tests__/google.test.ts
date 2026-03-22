import { describe, it, expect } from 'bun:test';
import { GoogleFont, getUsedFonts } from '../google';

describe('GoogleFont', () => {
  it('should track used fonts', () => {
    // Clear any previous state
    getUsedFonts();

    GoogleFont('Inter', { weight: 400 });
    GoogleFont('Roboto', { weight: 700 });

    const used = getUsedFonts();
    expect(used.length).toBe(2);
    expect(used[0]).toContain('family=Inter');
    expect(used[1]).toContain('family=Roboto');
  });

  it('should return correct className and style', () => {
    const font = GoogleFont('Open Sans');
    expect(font.className).toBe('__jen-font-open-sans');
    expect(font.style.fontFamily).toContain('Open Sans');
  });

  it('should clear fonts after getUsedFonts', () => {
    GoogleFont('Inter');
    getUsedFonts();
    expect(getUsedFonts().length).toBe(0);
  });
});
