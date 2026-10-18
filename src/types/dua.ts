export type CategoryId = 'sokal' | 'sondha' | 'namaz';

export interface Dua {
  id: string;
  categoryId: CategoryId;
  titleBangla: string;           // যেমন: "আল্লাহর সন্তুষ্টি লাভের দোয়া"
  arabic: string;                // যেমন: "رَضِيتُ بِاللهِ رَبًّا ، وَبِالإِسْلاَمِ دِيْنًا ، وَبِمُحَمَّدٍ نَبِيًّا"
  pronunciationBangla: string;   // উচ্চারণ
  meaningBangla: string;         // অর্থ
  benefitBangla: string;         // ফযীলত
  referenceBangla: string;       // রেফারেন্স
  repetitionCount: number;       // যেমন: ৩
  repetitionText: string;        // যেমন: "৩ বার"
}

export interface Category {
  id: CategoryId;
  titleBangla: string;
  subtitleBangla: string;
  timeBangla: string;
  icon: string;
}

export interface DailyProgressState {
  lastDate: string; // YYYY-MM-DD
  readDuaIds: string[];
  duaTapCounts: Record<string, number>; // id -> current count
}

export type ArabicFontChoice = 'noorehuda' | 'AlMajeed' | 'Hafs';

export interface AppSettings {
  showUccharon: boolean;
  showOrtho: boolean;
  showFazilat: boolean;
  arabicFontSize: number;
  arabicFont: ArabicFontChoice;
}
