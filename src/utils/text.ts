/**
 * Enhances Arabic typography by adjusting inter-word spacing.
 * This provides optimal readability across both web and native mobile devices (iOS/Android)
 * where CSS wordSpacing is not supported natively.
 */
export function formatArabicText(text?: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => line.trim().replace(/ +/g, '  '))
    .join('\n');
}
