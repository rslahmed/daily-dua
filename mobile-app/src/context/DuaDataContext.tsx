import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Category, Dua } from '../types/dua';
import { loadOfflineData, checkForDataUpdates, forceSyncData } from '../services/dataSyncService';

interface DuaDataContextType {
  categories: Category[];
  duas: Dua[];
  dataVersion: number;
  isDataLoaded: boolean;
  isSyncing: boolean;
  checkForUpdates: () => Promise<boolean>;
  forceSync: () => Promise<{
    success: boolean;
    categories?: Category[];
    duas?: Dua[];
    version?: number;
    error?: string;
  }>;
}

const DuaDataContext = createContext<DuaDataContextType | undefined>(undefined);

export const DuaDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [dataVersion, setDataVersion] = useState<number>(1);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 1. Instant Offline Startup
    loadOfflineData().then((cached) => {
      setCategories(cached.categories);
      setDuas(cached.duas);
      setDataVersion(cached.version);
      setIsDataLoaded(true);

      // 2. Silent Background Sync Check (if online)
      runBackgroundSync();
    });

    // 3. Auto sync when app returns from background to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current?.match(/inactive|background/) && nextAppState === 'active') {
        runBackgroundSync();
      }
      appState.current = nextAppState;
    });

    // 4. Periodic background sync check every 25 seconds when active
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') {
        runBackgroundSync();
      }
    }, 25000);

    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, []);

  const runBackgroundSync = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const result = await checkForDataUpdates();
      if (result.hasUpdate && result.categories && result.duas) {
        setCategories(result.categories);
        setDuas(result.duas);
        if (result.version) {
          setDataVersion(result.version);
        }
        return true;
      }
    } catch {
      // Ignore background sync errors
    } finally {
      setIsSyncing(false);
    }
    return false;
  };

  const runForceSync = async (): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const result = await forceSyncData();
      if (result.success && result.categories && result.duas) {
        setCategories(result.categories);
        setDuas(result.duas);
        if (result.version) {
          setDataVersion(result.version);
        }
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e: any) {
      return { success: false, error: e?.message || 'সিঙ্ক ব্যর্থ হয়েছে' };
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DuaDataContext.Provider
      value={{
        categories,
        duas,
        dataVersion,
        isDataLoaded,
        isSyncing,
        checkForUpdates: runBackgroundSync,
        forceSync: runForceSync,
      }}
    >
      {children}
    </DuaDataContext.Provider>
  );
};

export const useDuaData = (): DuaDataContextType => {
  const context = useContext(DuaDataContext);
  if (!context) {
    throw new Error('useDuaData must be used within a DuaDataProvider');
  }
  return context;
};
