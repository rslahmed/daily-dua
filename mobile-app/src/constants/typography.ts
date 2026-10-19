export interface ArabicFontSizeOption {
	label: string
	size: number
}

/**
 * Available Arabic font sizes in the app (used in settings and selectors).
 * You can adjust font size numbers (in px) or labels right here.
 */
export const ARABIC_FONT_SIZES: ArabicFontSizeOption[] = [
	{ label: "ছোট", size: 22 },
	{ label: "সাধারণ", size: 26 },
	{ label: "বড়", size: 30 },
	{ label: "খুব বড়", size: 34 },
]

/**
 * Global Arabic Typography Configuration
 *
 * Modify values here to change Arabic font family, line height,
 * letter spacing, word spacing, font sizes, or defaults across the entire app.
 */
export const ARABIC_TYPOGRAPHY = {
	/**
	 * The single, standard Arabic font used throughout the entire app.
	 */
	fontFamily: "noorehuda",

	/**
	 * Line height multiplier relative to font size.
	 * e.g., 1.75 means lineHeight = Math.round(fontSize * 1.75)
	 */
	lineHeightMultiplier: 1.75,

	/**
	 * Letter spacing for Arabic text.
	 */
	letterSpacing: 3.0,

	/**
	 * Inter-word spacing substitute.
	 * Since React Native does not support the CSS wordSpacing property natively,
	 * formatArabicText() replaces spaces with this string (e.g. 2 spaces).
	 */
	wordSpacing: "  ",

	/**
	 * Available font sizes list (ছোট, সাধারণ, বড়, খুব বড়).
	 */
	fontSizes: ARABIC_FONT_SIZES,

	/**
	 * Default Arabic font family name.
	 */
	defaultFont: "noorehuda",

	/**
	 * Default Arabic font size (px).
	 */
	defaultFontSize: 26,
} as const

/**
 * Calculates the line height for Arabic text based on font size.
 */
export function getArabicLineHeight(fontSize: number): number {
	return Math.round(fontSize * ARABIC_TYPOGRAPHY.lineHeightMultiplier)
}
