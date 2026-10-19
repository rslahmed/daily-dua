import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Dua } from '../types/dua';
import { loadOfflineData, checkForDataUpdates } from '../services/dataSyncService';

interface DuaDataContextType {
  categories: Category[];
  duas: Dua[];
  dataVersion: number;
  isDataLoaded: boolean;
  isSyncing: boolean;
  checkForUpdates: () => Promise<boolean>;
}

const DuaDataContext = createContext<DuaDataContextType | undefined>(undefined);

export const DuaDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [dataVersion, setDataVersion] = useState<number>(1);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  return (
    <DuaDataContext.Provider
      value={{
        categories,
        duas,
        dataVersion,
        isDataLoaded,
        isSyncing,
        checkForUpdates: runBackgroundSync,
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
