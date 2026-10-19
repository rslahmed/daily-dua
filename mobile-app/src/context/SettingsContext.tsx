import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types/dua';
import { ARABIC_TYPOGRAPHY } from '../constants/typography';

interface SettingsContextType extends AppSettings {
  setShowUccharon: (val: boolean) => Promise<void>;
  setShowOrtho: (val: boolean) => Promise<void>;
  setShowFazilat: (val: boolean) => Promise<void>;
  setArabicFontSize: (val: number) => Promise<void>;
  isSettingsLoaded: boolean;
}

const SETTINGS_STORAGE_KEY = '@daily_dua_settings';

const defaultSettings: AppSettings = {
  showUccharon: true,
  showOrtho: true,
  showFazilat: true,
  arabicFontSize: ARABIC_TYPOGRAPHY.defaultFontSize,
  arabicFont: 'noorehuda',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed: Partial<AppSettings> = JSON.parse(stored);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          arabicFont: 'noorehuda',
        }));
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    } finally {
      setIsSettingsLoaded(true);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

  const setShowUccharon = async (val: boolean) => {
    await saveSettings({ ...settings, showUccharon: val });
  };

  const setShowOrtho = async (val: boolean) => {
    await saveSettings({ ...settings, showOrtho: val });
  };

  const setShowFazilat = async (val: boolean) => {
    await saveSettings({ ...settings, showFazilat: val });
  };

  const setArabicFontSize = async (val: number) => {
    await saveSettings({ ...settings, arabicFontSize: val });
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setShowUccharon,
        setShowOrtho,
        setShowFazilat,
        setArabicFontSize,
        isSettingsLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
