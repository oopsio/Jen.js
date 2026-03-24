/**
 * Options for fetching a Google Font.
 */
export interface GoogleFontOptions {
  /** The font weight(s) to fetch (e.g. 400, "400..700") */
  weight?: string | number | (string | number)[];
  /** Subsets required like "latin", "cyrillic" */
  subsets?: string[];
  /** Standard CSS `font-display` behavior (defaults to "swap") */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

/**
 * Internal system tracker for fonts requested during the Server-Side Render pass.
 */
const usedFonts = new Set<string>();

/**
 * Retrieves and clears the list of used Google Font URLs.
 * Injected automatically into the document `<head>`.
 */
export function getUsedFonts() {
  const fonts = Array.from(usedFonts);
  usedFonts.clear();
  return fonts;
}

/**
 * Registers an optimized Google Font for the current page instance.
 * Automatically injects preconnects/links into SSR markup, and returns an object
 * containing className and CSS variables for React styling.
 *
 * @param fontName The exact name of the Google Font family (e.g. "Inter")
 * @param options Styling and subsetting options
 */
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
