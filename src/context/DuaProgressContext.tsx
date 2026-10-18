import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { CategoryId, DailyProgressState, Dua } from '../types/dua';
import { getTodayDateString } from '../utils/date';
import duasDataRaw from '../data/duas.json';

const allDuas: Dua[] = duasDataRaw as Dua[];

const PROGRESS_STORAGE_KEY = '@daily_dua_progress';

interface CategoryProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface DuaProgressContextType {
  readDuaIds: string[];
  duaTapCounts: Record<string, number>;
  toggleDuaRead: (duaId: string) => Promise<void>;
  incrementDuaTap: (dua: Dua) => Promise<void>;
  resetDuaTap: (duaId: string) => Promise<void>;
  isDuaRead: (duaId: string) => boolean;
  getDuaTapCount: (duaId: string) => number;
  getCategoryProgress: (categoryId: CategoryId) => CategoryProgress;
  getOverallProgress: () => CategoryProgress;
  resetTodayProgress: () => Promise<void>;
  isProgressLoaded: boolean;
}

const DuaProgressContext = createContext<DuaProgressContextType | undefined>(undefined);

export const DuaProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readDuaIds, setReadDuaIds] = useState<string[]>([]);
  const [duaTapCounts, setDuaTapCounts] = useState<Record<string, number>>({});
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const triggerHaptic = async (type: 'light' | 'success') => {
    if (Platform.OS === 'web') return;
    try {
      if (type === 'light') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Ignore haptics error on platforms that don't support it
    }
  };

  const loadProgress = async () => {
    try {
      const today = getTodayDateString();
      const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);

      if (stored) {
        const parsed: DailyProgressState = JSON.parse(stored);
        if (parsed.lastDate === today) {
          const namazDuaIds = new Set(allDuas.filter((d) => d.categoryId === 'namaz').map((d) => d.id));
          const cleanedReadIds = (parsed.readDuaIds || []).filter((id) => !namazDuaIds.has(id));
          const cleanedTapCounts = { ...(parsed.duaTapCounts || {}) };
          namazDuaIds.forEach((id) => {
            delete cleanedTapCounts[id];
          });
          setReadDuaIds(cleanedReadIds);
          setDuaTapCounts(cleanedTapCounts);
          setIsProgressLoaded(true);
          return;
        }
      }

      // If no stored data or date has changed -> Reset for today!
      const freshState: DailyProgressState = {
        lastDate: today,
        readDuaIds: [],
        duaTapCounts: {},
      };
      setReadDuaIds([]);
      setDuaTapCounts({});
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(freshState));
    } catch (e) {
      console.warn('Failed to load daily progress:', e);
    } finally {
      setIsProgressLoaded(true);
    }
  };

  const persistState = async (updatedReadIds: string[], updatedTapCounts: Record<string, number>) => {
    try {
      const stateToSave: DailyProgressState = {
        lastDate: getTodayDateString(),
        readDuaIds: updatedReadIds,
        duaTapCounts: updatedTapCounts,
      };
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save daily progress:', e);
    }
  };

  const toggleDuaRead = async (duaId: string) => {
    const dua = allDuas.find((d) => d.id === duaId);
    if (dua && dua.categoryId === 'namaz') {
      return;
    }

    const isCurrentlyRead = readDuaIds.includes(duaId);
    let updatedReadIds: string[];
    let updatedTapCounts = { ...duaTapCounts };

    const targetCount = dua ? dua.repetitionCount : 1;

    if (isCurrentlyRead) {
      updatedReadIds = readDuaIds.filter((id) => id !== duaId);
      updatedTapCounts[duaId] = 0;
      await triggerHaptic('light');
    } else {
      updatedReadIds = [...readDuaIds, duaId];
      updatedTapCounts[duaId] = targetCount;
      await triggerHaptic('success');
    }

    setReadDuaIds(updatedReadIds);
    setDuaTapCounts(updatedTapCounts);
    await persistState(updatedReadIds, updatedTapCounts);
  };

  const incrementDuaTap = async (dua: Dua) => {
    if (dua.categoryId === 'namaz') {
      return;
    }

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
      await triggerHaptic('success');
    } else {
      await triggerHaptic('light');
    }

    setReadDuaIds(updatedReadIds);
    setDuaTapCounts(updatedTapCounts);
    await persistState(updatedReadIds, updatedTapCounts);
  };

  const resetDuaTap = async (duaId: string) => {
    const updatedReadIds = readDuaIds.filter((id) => id !== duaId);
    const updatedTapCounts = { ...duaTapCounts, [duaId]: 0 };
    setReadDuaIds(updatedReadIds);
    setDuaTapCounts(updatedTapCounts);
    await persistState(updatedReadIds, updatedTapCounts);
    await triggerHaptic('light');
  };

  const isDuaRead = (duaId: string): boolean => {
    return readDuaIds.includes(duaId);
  };

  const getDuaTapCount = (duaId: string): number => {
    return duaTapCounts[duaId] || 0;
  };

  const getCategoryProgress = (categoryId: CategoryId): CategoryProgress => {
    const categoryDuas = allDuas.filter((d) => d.categoryId === categoryId);
    const total = categoryDuas.length;
    if (categoryId === 'namaz') {
      return { completed: 0, total, percentage: 0 };
    }
    const completed = categoryDuas.filter((d) => readDuaIds.includes(d.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const getOverallProgress = (): CategoryProgress => {
    // Only track daily routine categories (sokal, sondha), namaz is recited after each obligatory prayer
    const trackableDuas = allDuas.filter((d) => d.categoryId !== 'namaz');
    const total = trackableDuas.length;
    const completed = trackableDuas.filter((d) => readDuaIds.includes(d.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const resetTodayProgress = async () => {
    setReadDuaIds([]);
    setDuaTapCounts({});
    await persistState([], {});
    await triggerHaptic('light');
  };

  return (
    <DuaProgressContext.Provider
      value={{
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
        isProgressLoaded,
      }}
    >
      {children}
    </DuaProgressContext.Provider>
  );
};

export const useDuaProgress = (): DuaProgressContextType => {
  const context = useContext(DuaProgressContext);
  if (!context) {
    throw new Error('useDuaProgress must be used within a DuaProgressProvider');
  }
  return context;
};
