export type CategoryId = string;

export interface Dua {
  id: string;
  categoryId?: string;           // Primary category ID
  categoryIds?: string[];        // Array of category IDs (for multi-category support)
  titleBangla: string;           // যেমন: "আল্লাহর সন্তুষ্টি লাভের দোয়া"
  arabic: string;                // যেমন: "رَضِيتُ بِاللهِ رَبًّا ، وَبِالإِسْلاَمِ دِيْنًا ، وَبِمُحَمَّدٍ نَبِيًّا"
  pronunciationBangla: string;   // উচ্চারণ
  meaningBangla: string;         // অর্থ
  benefitBangla: string;         // ফযীলত
  referenceBangla: string;       // রেফারেন্স
  repetitionCount: number;       // যেমন: ৩
  repetitionText: string;        // যেমন: "৩ বার"
  sortOrder?: number;
}

export interface Category {
  id: string;
  nameBangla?: string;
  titleBangla: string;
  subtitleBangla: string;
  timeBangla: string;
  icon: string;
  hasProgress?: boolean;         // true = daily counter & progress; false = plain recitation
  sortOrder?: number;
}

export interface DailyProgressState {
  lastDate: string; // YYYY-MM-DD
  readDuaIds: string[];
  duaTapCounts: Record<string, number>; // id -> current count
}

export type ArabicFontChoice = 'noorehuda';

export interface AppSettings {
  showUccharon: boolean;
  showOrtho: boolean;
  showFazilat: boolean;
  arabicFontSize: number;
  arabicFont?: ArabicFontChoice;
}
