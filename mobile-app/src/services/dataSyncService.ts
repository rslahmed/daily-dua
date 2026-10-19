import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Dua } from '../types/dua';
import initialCategoriesRaw from '../data/categories.json';
import initialDuasRaw from '../data/duas.json';

const CACHED_CATEGORIES_KEY = '@daily_dua_cached_categories';
const CACHED_DUAS_KEY = '@daily_dua_cached_duas';
const DATA_VERSION_KEY = '@daily_dua_data_version';
const API_URL_KEY = '@daily_dua_api_url';

// Default API URL (can be customized or pointed to production cPanel domain)
export const DEFAULT_API_URL = 'https://dailydua.com/api';

export async function getApiUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    return custom || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export async function getLocalVersion(): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(DATA_VERSION_KEY);
    return v ? parseInt(v, 10) : 1;
  } catch {
    return 1;
  }
}

/**
 * 100% Offline-First Initial Loader
 * Reads from local cache first. If empty (first launch ever), uses bundled JSON files.
 * Zero network requirement, 0ms startup delay.
 */
export async function loadOfflineData(): Promise<{
  categories: Category[];
  duas: Dua[];
  version: number;
}> {
  try {
    const [storedCategories, storedDuas, storedVersion] = await Promise.all([
      AsyncStorage.getItem(CACHED_CATEGORIES_KEY),
      AsyncStorage.getItem(CACHED_DUAS_KEY),
      AsyncStorage.getItem(DATA_VERSION_KEY),
    ]);

    if (storedCategories && storedDuas) {
      return {
        categories: JSON.parse(storedCategories),
        duas: JSON.parse(storedDuas),
        version: storedVersion ? parseInt(storedVersion, 10) : 1,
      };
    }
  } catch (e) {
    console.warn('Failed to read cached data from AsyncStorage, using bundled data:', e);
  }

  // Fallback to bundled JSON files on initial app install
  const bundledCategories: Category[] = (initialCategoriesRaw as any[]).map((c) => ({
    ...c,
    nameBangla: c.nameBangla || c.titleBangla,
    hasProgress: c.hasProgress !== undefined ? c.hasProgress : c.id !== 'namaz',
  }));

  const bundledDuas: Dua[] = (initialDuasRaw as any[]).map((d) => ({
    ...d,
    categoryIds: d.categoryIds || (d.categoryId ? [d.categoryId] : []),
  }));

  // Cache initial data
  AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(bundledCategories)).catch(() => {});
  AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(bundledDuas)).catch(() => {});
  AsyncStorage.setItem(DATA_VERSION_KEY, '1').catch(() => {});

  return {
    categories: bundledCategories,
    duas: bundledDuas,
    version: 1,
  };
}

/**
 * Background Sync Check
 * Checks remote version. If higher, downloads updated categories & duas and saves locally.
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

    // 1. Version Check with short 3.5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const versionRes = await fetch(`${baseUrl}/version.php`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!versionRes.ok) return { hasUpdate: false };

    const versionData = await versionRes.json();
    const remoteVersion = versionData.version || 1;

    // If local is already up to date, no need to download full payload
    if (remoteVersion <= localVersion) {
      return { hasUpdate: false };
    }

    // 2. Fetch full updated payload
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

    // 3. Persist locally to AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(duas)),
      AsyncStorage.setItem(DATA_VERSION_KEY, String(remoteVersion)),
    ]);

    return {
      hasUpdate: true,
      categories,
      duas,
      version: remoteVersion,
    };
  } catch {
    // Offline or unreachable: fail silently
    return { hasUpdate: false };
  }
}
