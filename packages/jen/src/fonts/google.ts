export interface GoogleFontOptions {
  weight?: string | number | (string | number)[];
  subsets?: string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

const usedFonts = new Set<string>();

export function getUsedFonts() {
  const fonts = Array.from(usedFonts);
  usedFonts.clear();
  return fonts;
}

export function GoogleFont(fontName: string, options: GoogleFontOptions = {}) {
  const { weight = 400, subsets = ['latin'], display = 'swap' } = options;
  const weights = Array.isArray(weight) ? weight.join(',') : weight;
  const subsetString = subsets.join(',');

  const googleUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weights}&display=${display}&subset=${subsetString}`;

  const className = `__jen-font-${fontName.toLowerCase().replace(/ /g, '-')}`;

  // Track font for SSR injection (this part only runs during SSR in a real app,
  // but on the client it just populates a set that never gets read)
  if (typeof window === 'undefined') {
    usedFonts.add(googleUrl);
  }

  return {
    className,
    variable: `--font-${fontName.toLowerCase().replace(/ /g, '-')}`,
    style: { fontFamily: `'${fontName}', sans-serif` },
    href: googleUrl,
  };
}
