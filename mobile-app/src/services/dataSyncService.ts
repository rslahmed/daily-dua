import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { Category, Dua } from '../types/dua';
import initialCategoriesRaw from '../data/categories.json';
import initialDuasRaw from '../data/duas.json';
import initialVersionRaw from '../data/version.json';

const CACHED_CATEGORIES_KEY = '@daily_dua_cached_categories';
const CACHED_DUAS_KEY = '@daily_dua_cached_duas';
const DATA_VERSION_KEY = '@daily_dua_data_version';
const API_URL_KEY = '@daily_dua_api_url';

export const BUNDLED_VERSION: number = initialVersionRaw?.version || 2;

/**
 * Automatically detect development machine IP from Metro bundle URL.
 * When running on a physical phone via Expo, NativeModules.SourceCode.scriptURL contains
 * the LAN IP of the computer (e.g. http://192.168.0.151:8081/index.bundle?...).
 */
export function getDevServerHost(): string | null {
  if (__DEV__) {
    try {
      const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
      if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
        if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
          return match[1];
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function getDefaultApiUrl(): string {
  const devHost = getDevServerHost();
  if (devHost) {
    return `http://${devHost}:8000/api`;
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api'
    : 'http://localhost:8000/api';
}

export async function getApiUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    // If old placeholder live URL was cached, clear it so local server is used
    if (custom && custom.includes('dailydua.com')) {
      await AsyncStorage.removeItem(API_URL_KEY);
      return getDefaultApiUrl();
    }
    return custom || getDefaultApiUrl();
  } catch {
    return getDefaultApiUrl();
  }
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export async function getLocalVersion(): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(DATA_VERSION_KEY);
    return v ? parseInt(v, 10) : BUNDLED_VERSION;
  } catch {
    return BUNDLED_VERSION;
  }
}

/**
 * 100% Offline-First Initial Loader
 * Reads from local cache first. If cache is outdated compared to bundled files (e.g. new category added),
 * it automatically upgrades to the latest bundled categories and duas with 0ms startup delay.
 */
export async function loadOfflineData(): Promise<{
  categories: Category[];
  duas: Dua[];
  version: number;
}> {
  const bundledCategories: Category[] = (initialCategoriesRaw as any[]).map((c) => ({
    ...c,
    nameBangla: c.nameBangla || c.titleBangla,
    titleBangla: c.titleBangla || c.nameBangla,
    hasProgress: c.hasProgress !== undefined ? c.hasProgress : c.id !== 'namaz',
  }));

  const bundledDuas: Dua[] = (initialDuasRaw as any[]).map((d) => ({
    ...d,
    categoryIds: d.categoryIds || (d.categoryId ? [d.categoryId] : []),
  }));

  try {
    const [storedCategories, storedDuas, storedVersion] = await Promise.all([
      AsyncStorage.getItem(CACHED_CATEGORIES_KEY),
      AsyncStorage.getItem(CACHED_DUAS_KEY),
      AsyncStorage.getItem(DATA_VERSION_KEY),
    ]);

    if (storedCategories && storedDuas) {
      const parsedCategories: Category[] = JSON.parse(storedCategories);
      const parsedDuas: Dua[] = JSON.parse(storedDuas);
      const parsedVersion = storedVersion ? parseInt(storedVersion, 10) : 1;

      // Cache is fresh ONLY IF:
      // 1. Cached version >= bundled version, AND
      // 2. Cached categories count >= bundled categories count
      if (parsedVersion >= BUNDLED_VERSION && parsedCategories.length >= bundledCategories.length) {
        return {
          categories: parsedCategories,
          duas: parsedDuas,
          version: parsedVersion,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to read cached data from AsyncStorage, using bundled data:', e);
  }

  // Cache is missing or outdated compared to bundled files — upgrade AsyncStorage:
  await Promise.all([
    AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(bundledCategories)),
    AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(bundledDuas)),
    AsyncStorage.setItem(DATA_VERSION_KEY, String(BUNDLED_VERSION)),
  ]).catch(() => {});

  return {
    categories: bundledCategories,
    duas: bundledDuas,
    version: BUNDLED_VERSION,
  };
}

/**
 * Background Sync Check
 * Checks remote version or categories count. If higher, downloads updated categories & duas and saves locally.
 * If offline or server unreachable, fails silently without interrupting the user.
 */
export async function checkForDataUpdates(): Promise<{
  hasUpdate: boolean;
  categories?: Category[];
  duas?: Dua[];
  version?: number;
}> {
  try {
    const baseUrl = await getApiUrl();
    const localVersion = await getLocalVersion();

    // 1. Version Check with 4s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const versionRes = await fetch(`${baseUrl}/version.php`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!versionRes.ok) return { hasUpdate: false };

    const versionData = await versionRes.json();
    const remoteVersion = versionData.version || 1;

    // Read cached categories count
    const cachedCatJson = await AsyncStorage.getItem(CACHED_CATEGORIES_KEY);
    const cachedCount = cachedCatJson ? JSON.parse(cachedCatJson).length : 0;

    // If local version is already up to date and has all categories, skip
    if (remoteVersion <= localVersion && cachedCount >= initialCategoriesRaw.length) {
      return { hasUpdate: false };
    }

    // 2. Fetch full updated payload from sync.php
    const syncRes = await fetch(`${baseUrl}/sync.php`);
    if (!syncRes.ok) return { hasUpdate: false };

    const syncData = await syncRes.json();
    const categories: Category[] = (syncData.categories || []).map((c: any) => ({
      ...c,
      nameBangla: c.nameBangla || c.titleBangla,
      titleBangla: c.titleBangla || c.nameBangla,
      hasProgress: c.hasProgress !== undefined ? c.hasProgress : c.id !== 'namaz',
    }));

    const duas: Dua[] = (syncData.duas || []).map((d: any) => ({
      ...d,
      categoryIds: d.categoryIds || (d.categoryId ? [d.categoryId] : []),
    }));

    if (categories.length === 0) return { hasUpdate: false };

    const newVersion = Math.max(remoteVersion, BUNDLED_VERSION);

    // 3. Persist locally to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(duas)),
      AsyncStorage.setItem(DATA_VERSION_KEY, String(newVersion)),
    ]);

    return {
      hasUpdate: true,
      categories,
      duas,
      version: newVersion,
    };
  } catch {
    // Offline or unreachable: fail silently
    return { hasUpdate: false };
  }
}

/**
 * Force manual sync with server (triggered by user pull-to-refresh or Settings button)
 */
export async function forceSyncData(): Promise<{
  success: boolean;
  categories?: Category[];
  duas?: Dua[];
  version?: number;
  error?: string;
}> {
  try {
    const baseUrl = await getApiUrl();
    const syncRes = await fetch(`${baseUrl}/sync.php`);
    if (!syncRes.ok) {
      return { success: false, error: 'সার্ভারে সংযোগ করা যায়নি।' };
    }

    const syncData = await syncRes.json();
    const categories: Category[] = (syncData.categories || []).map((c: any) => ({
      ...c,
      nameBangla: c.nameBangla || c.titleBangla,
      titleBangla: c.titleBangla || c.nameBangla,
      hasProgress: c.hasProgress !== undefined ? c.hasProgress : c.id !== 'namaz',
    }));

    const duas: Dua[] = (syncData.duas || []).map((d: any) => ({
      ...d,
      categoryIds: d.categoryIds || (d.categoryId ? [d.categoryId] : []),
    }));

    if (categories.length === 0) {
      return { success: false, error: 'কোনো ডাটা পাওয়া যায়নি।' };
    }

    const version = syncData.version || BUNDLED_VERSION;

    await Promise.all([
      AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(duas)),
      AsyncStorage.setItem(DATA_VERSION_KEY, String(version)),
    ]);

    return {
      success: true,
      categories,
      duas,
      version,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'সার্ভার সিঙ্ক ব্যর্থ হয়েছে।' };
  }
}
