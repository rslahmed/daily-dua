import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Dua, AppSettings, DailyProgressState } from '../types/dua';
import { getTodayDateString } from '../utils/date';
import { fetchPublicData } from '../services/api';

interface CategoryProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface DuaContextType {
  categories: Category[];
  duas: Dua[];
  isLoading: boolean;
  readDuaIds: string[];
  duaTapCounts: Record<string, number>;
  toggleDuaRead: (duaId: string) => void;
  incrementDuaTap: (dua: Dua) => void;
  resetDuaTap: (duaId: string) => void;
  isDuaRead: (duaId: string) => boolean;
  getDuaTapCount: (duaId: string) => number;
  getCategoryProgress: (categoryId: string) => CategoryProgress;
  getOverallProgress: () => CategoryProgress;
  resetTodayProgress: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  refreshData: () => Promise<void>;
}

const PROGRESS_STORAGE_KEY = '@daily_dua_web_progress';
const SETTINGS_STORAGE_KEY = '@daily_dua_web_settings';
const CATEGORIES_CACHE_KEY = '@daily_dua_cached_categories';
const DUAS_CACHE_KEY = '@daily_dua_cached_duas';

const defaultSettings: AppSettings = {
  showUccharon: true,
  showOrtho: true,
  showFazilat: true,
  arabicFontSize: 26,
};

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(CATEGORIES_CACHE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [duas, setDuas] = useState<Dua[]>(() => {
    try {
      const stored = localStorage.getItem(DUAS_CACHE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(() => {
    try {
      const stored = localStorage.getItem(CATEGORIES_CACHE_KEY);
      return !stored || JSON.parse(stored).length === 0;
    } catch {
      return true;
    }
  });

  const [readDuaIds, setReadDuaIds] = useState<string[]>([]);
  const [duaTapCounts, setDuaTapCounts] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const loadData = async () => {
    try {
      const res = await fetchPublicData();
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
        try {
          localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(res.categories));
        } catch {
          // ignore cache write error
        }
      }
      if (res.duas && res.duas.length > 0) {
        setDuas(res.duas);
        try {
          localStorage.setItem(DUAS_CACHE_KEY, JSON.stringify(res.duas));
        } catch {
          // ignore cache write error
        }
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadProgress();
  }, []);

  const loadProgress = () => {
    try {
      const today = getTodayDateString();
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        const parsed: DailyProgressState = JSON.parse(stored);
        if (parsed.lastDate === today) {
          setReadDuaIds(parsed.readDuaIds || []);
          setDuaTapCounts(parsed.duaTapCounts || {});
          return;
        }
      }
      // New day -> reset
      const freshState: DailyProgressState = {
        lastDate: today,
        readDuaIds: [],
        duaTapCounts: {},
      };
      setReadDuaIds([]);
      setDuaTapCounts({});
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(freshState));
    } catch (e) {
      console.warn('Failed to load daily progress:', e);
    }
  };

  const persistProgress = (updatedReadIds: string[], updatedTapCounts: Record<string, number>) => {
    try {
      const stateToSave: DailyProgressState = {
        lastDate: getTodayDateString(),
        readDuaIds: updatedReadIds,
        duaTapCounts: updatedTapCounts,
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save daily progress:', e);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save settings:', e);
      }
      return updated;
    });
  };

  const toggleDuaRead = (duaId: string) => {
    const isCurrentlyRead = readDuaIds.includes(duaId);
    const dua = duas.find((d) => d.id === duaId);
    let updatedReadIds: string[];
    let updatedTapCounts = { ...duaTapCounts };
    const targetCount = dua ? dua.repetitionCount : 1;

    if (isCurrentlyRead) {
      updatedReadIds = readDuaIds.filter((id) => id !== duaId);
      updatedTapCounts[duaId] = 0;
    } else {
      updatedReadIds = [...readDuaIds, duaId];
      updatedTapCounts[duaId] = targetCount;
    }

    setReadDuaIds(updatedReadIds);
    setDuaTapCounts(updatedTapCounts);
    persistProgress(updatedReadIds, updatedTapCounts);
  };

  const incrementDuaTap = (dua: Dua) => {
    const current = duaTapCounts[dua.id] || 0;
    const target = dua.repetitionCount;
    const next = current + 1;

    let updatedReadIds = [...readDuaIds];
    let updatedTapCounts = { ...duaTapCounts, [dua.id]: next };

    if (next >= target) {
      if (!updatedReadIds.includes(dua.id)) {
        updatedReadIds.push(dua.id);
      }
      updatedTapCounts[dua.id] = target;
    }

    setReadDuaIds(updatedReadIds);
    setDuaTapCounts(updatedTapCounts);
    persistProgress(updatedReadIds, updatedTapCounts);
  };

  const resetDuaTap = (duaId: string) => {
    const updatedReadIds = readDuaIds.filter((id) => id !== duaId);
    const updatedTapCounts = { ...duaTapCounts, [duaId]: 0 };
    setReadDuaIds(updatedReadIds);
    setDuaTapCounts(updatedTapCounts);
    persistProgress(updatedReadIds, updatedTapCounts);
  };

  const isDuaRead = (duaId: string): boolean => {
    return readDuaIds.includes(duaId);
  };

  const getDuaTapCount = (duaId: string): number => {
    return duaTapCounts[duaId] || 0;
  };

  const getCategoryProgress = (categoryId: string): CategoryProgress => {
    const category = categories.find((c) => c.id === categoryId);
    const catDuas = duas.filter(
      (d) => d.categoryIds?.includes(categoryId) || d.categoryId === categoryId
    );
    const total = catDuas.length;

    if (category && category.hasProgress === false) {
      return { completed: 0, total, percentage: 0 };
    }

    const completed = catDuas.filter((d) => readDuaIds.includes(d.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const getOverallProgress = (): CategoryProgress => {
    // Only track categories that have progress enabled
    const trackableCategories = categories.filter((c) => c.hasProgress !== false);
    const trackableCatIds = new Set(trackableCategories.map((c) => c.id));

    // Get unique duas in trackable categories
    const trackableDuas = duas.filter((d) =>
      d.categoryIds?.some((cId) => trackableCatIds.has(cId)) ||
      (d.categoryId && trackableCatIds.has(d.categoryId))
    );

    const total = trackableDuas.length;
    const completed = trackableDuas.filter((d) => readDuaIds.includes(d.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const resetTodayProgress = () => {
    setReadDuaIds([]);
    setDuaTapCounts({});
    persistProgress([], {});
  };

  return (
    <DuaContext.Provider
      value={{
        categories,
        duas,
        isLoading,
        readDuaIds,
        duaTapCounts,
        toggleDuaRead,
        incrementDuaTap,
        resetDuaTap,
        isDuaRead,
        getDuaTapCount,
        getCategoryProgress,
        getOverallProgress,
        resetTodayProgress,
        settings,
        updateSettings,
        refreshData: loadData,
      }}
    >
      {children}
    </DuaContext.Provider>
  );
};

export const useDua = (): DuaContextType => {
  const context = useContext(DuaContext);
  if (!context) {
    throw new Error('useDua must be used within a DuaProvider');
  }
  return context;
};
