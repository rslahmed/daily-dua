import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { CategoryId, DailyProgressState, Dua } from '../types/dua';
import { getTodayDateString } from '../utils/date';
import { useDuaData } from './DuaDataContext';

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
  const { duas, categories } = useDuaData();
  const [readDuaIds, setReadDuaIds] = useState<string[]>([]);
  const [duaTapCounts, setDuaTapCounts] = useState<Record<string, number>>({});
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [categories, duas]);

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
          // Exclude duas from categories that don't track progress (e.g. namaz)
          const nonTrackableCatIds = new Set(
            categories.filter((c) => c.hasProgress === false).map((c) => c.id)
          );

          const nonTrackableDuaIds = new Set(
            duas
              .filter((d) =>
                d.categoryIds?.every((cId) => nonTrackableCatIds.has(cId)) ||
                (d.categoryId && nonTrackableCatIds.has(d.categoryId))
              )
              .map((d) => d.id)
          );

          const cleanedReadIds = (parsed.readDuaIds || []).filter((id) => !nonTrackableDuaIds.has(id));
          const cleanedTapCounts = { ...(parsed.duaTapCounts || {}) };
          nonTrackableDuaIds.forEach((id) => {
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
    const isCurrentlyRead = readDuaIds.includes(duaId);
    let updatedReadIds: string[];
    let updatedTapCounts = { ...duaTapCounts };

    const dua = duas.find((d) => d.id === duaId);
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
    const cat = categories.find((c) => c.id === categoryId);
    const categoryDuas = duas.filter(
      (d) => d.categoryIds?.includes(categoryId) || d.categoryId === categoryId
    );
    const total = categoryDuas.length;

    if (cat && cat.hasProgress === false) {
      return { completed: 0, total, percentage: 0 };
    }

    const completed = categoryDuas.filter((d) => readDuaIds.includes(d.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const getOverallProgress = (): CategoryProgress => {
    // Only track categories that have progress enabled
    const trackableCategories = categories.filter((c) => c.hasProgress !== false);
    const trackableCatIds = new Set(trackableCategories.map((c) => c.id));

    const trackableDuas = duas.filter(
      (d) =>
        d.categoryIds?.some((cId) => trackableCatIds.has(cId)) ||
        (d.categoryId && trackableCatIds.has(d.categoryId))
    );

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
