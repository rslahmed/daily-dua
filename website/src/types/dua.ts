export interface Category {
  id: string;
  nameBangla: string;
  titleBangla?: string;
  subtitleBangla: string;
  timeBangla: string;
  icon: string;
  hasProgress: boolean;
  sortOrder?: number;
  totalDuas?: number;
}

export interface Dua {
  id: string;
  categoryIds: string[];
  categoryId?: string;
  titleBangla: string;
  arabic: string;
  pronunciationBangla: string;
  meaningBangla: string;
  benefitBangla: string;
  referenceBangla: string;
  repetitionCount: number;
  repetitionText: string;
  sortOrder?: number;
}

export interface DailyProgressState {
  lastDate: string; // YYYY-MM-DD
  readDuaIds: string[];
  duaTapCounts: Record<string, number>;
}

export interface AppSettings {
  showUccharon: boolean;
  showOrtho: boolean;
  showFazilat: boolean;
  arabicFontSize: number;
}
