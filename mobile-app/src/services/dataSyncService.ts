import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { Category, Dua } from '../types/dua';
import initialCategoriesRaw from '../data/categories.json';
import initialDuasRaw from '../data/duas.json';
import initialVersionRaw from '../data/version.json';

const CACHED_CATEGORIES_KEY = '@daily_dua_cached_categories';
const CACHED_DUAS_KEY = '@daily_dua_cached_duas';
const DATA_VERSION_KEY = '@daily_dua_data_version';
const DATA_LAST_UPDATED_KEY = '@daily_dua_last_updated';
const DATA_HASH_KEY = '@daily_dua_data_hash';
const API_URL_KEY = '@daily_dua_api_url';

export const BUNDLED_VERSION: number = initialVersionRaw?.version || 3;

/**
 * Automatically detect development machine IP from Metro bundle URL.
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
  return 'http://192.168.0.151:8000/api';
}

/**
 * Returns an ordered list of candidate URLs to reach the PHP API.
 * Physical phones on Wi-Fi will find the computer's LAN IP, simulators localhost/10.0.2.2.
 */
export async function getCandidateApiUrls(): Promise<string[]> {
  const candidates: string[] = [];

  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    if (custom && !custom.includes('dailydua.com')) {
      candidates.push(custom);
    }
  } catch {}

  const devHost = getDevServerHost();
  if (devHost) {
    candidates.push(`http://${devHost}:8000/api`);
  }

  // Developer machine local IP
  candidates.push('http://192.168.0.151:8000/api');

  if (Platform.OS === 'android') {
    candidates.push('http://10.0.2.2:8000/api');
  }
  candidates.push('http://localhost:8000/api');
  candidates.push('http://127.0.0.1:8000/api');

  return Array.from(new Set(candidates));
}

export async function getApiUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    if (custom && !custom.includes('dailydua.com')) {
      return custom;
    }
    return getDefaultApiUrl();
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

export async function getLocalLastUpdated(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(DATA_LAST_UPDATED_KEY)) || initialVersionRaw?.lastUpdated || '';
  } catch {
    return initialVersionRaw?.lastUpdated || '';
  }
}

export async function getLocalDataHash(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(DATA_HASH_KEY)) || '';
  } catch {
    return '';
  }
}

/**
 * 100% Offline-First Initial Loader
 * Reads from local cache first. If cache is missing or outdated compared to bundled files,
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
      // 2. Cached categories count >= bundled categories count, AND
      // 3. Cached duas count >= bundled duas count
      if (
        parsedVersion >= BUNDLED_VERSION &&
        parsedCategories.length >= bundledCategories.length &&
        parsedDuas.length >= bundledDuas.length
      ) {
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
    AsyncStorage.setItem(DATA_LAST_UPDATED_KEY, initialVersionRaw?.lastUpdated || ''),
  ]).catch(() => {});

  return {
    categories: bundledCategories,
    duas: bundledDuas,
    version: BUNDLED_VERSION,
  };
}

/**
 * Fetch with short timeout
 */
async function fetchWithTimeout(url: string, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/**
 * Tries candidate URLs until a working API endpoint is reached
 */
async function findWorkingApiUrl(): Promise<string | null> {
  const candidates = await getCandidateApiUrls();
  for (const url of candidates) {
    try {
      const res = await fetchWithTimeout(`${url}/version.php`, 2000);
      if (res.ok) {
        // Save working URL
        await AsyncStorage.setItem(API_URL_KEY, url);
        return url;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

/**
 * Background Sync Check
 * Checks remote version, hash, counts, or lastUpdated timestamp.
 * If ANY update has occurred, downloads updated categories & duas and saves locally.
 * If offline or server unreachable, fails silently without interrupting the user.
 */
export async function checkForDataUpdates(): Promise<{
  hasUpdate: boolean;
  categories?: Category[];
  duas?: Dua[];
  version?: number;
}> {
  try {
    const workingUrl = await findWorkingApiUrl();
    if (!workingUrl) return { hasUpdate: false };

    const [localVersion, localLastUpdated, localHash, cachedCatJson, cachedDuaJson] = await Promise.all([
      getLocalVersion(),
      getLocalLastUpdated(),
      getLocalDataHash(),
      AsyncStorage.getItem(CACHED_CATEGORIES_KEY),
      AsyncStorage.getItem(CACHED_DUAS_KEY),
    ]);

    const cachedCats: Category[] = cachedCatJson ? JSON.parse(cachedCatJson) : [];
    const cachedDuas: Dua[] = cachedDuaJson ? JSON.parse(cachedDuaJson) : [];

    const versionRes = await fetchWithTimeout(`${workingUrl}/version.php`, 3000);
    if (!versionRes.ok) return { hasUpdate: false };

    const versionData = await versionRes.json();
    const remoteVersion: number = versionData.version || 1;
    const remoteLastUpdated: string = versionData.lastUpdated || '';
    const remoteHash: string = versionData.hash || '';
    const remoteCatCount: number = versionData.totalCategories ?? -1;
    const remoteDuaCount: number = versionData.totalDuas ?? -1;

    // Detect if anything changed:
    const versionIncreased = remoteVersion > localVersion;
    const hashChanged = Boolean(remoteHash && localHash && remoteHash !== localHash);
    const timestampChanged = Boolean(remoteLastUpdated && localLastUpdated && remoteLastUpdated !== localLastUpdated);
    const catCountChanged = remoteCatCount >= 0 && cachedCats.length !== remoteCatCount;
    const duaCountChanged = remoteDuaCount >= 0 && cachedDuas.length !== remoteDuaCount;

    const needsUpdate =
      versionIncreased ||
      hashChanged ||
      timestampChanged ||
      catCountChanged ||
      duaCountChanged ||
      cachedCats.length === 0;

    if (!needsUpdate) {
      return { hasUpdate: false };
    }

    // Fetch full payload from sync.php
    const syncRes = await fetchWithTimeout(`${workingUrl}/sync.php`, 6000);
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

    const newVersion = Math.max(remoteVersion, localVersion, BUNDLED_VERSION);

    await Promise.all([
      AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(duas)),
      AsyncStorage.setItem(DATA_VERSION_KEY, String(newVersion)),
      AsyncStorage.setItem(DATA_LAST_UPDATED_KEY, remoteLastUpdated),
      AsyncStorage.setItem(DATA_HASH_KEY, remoteHash),
    ]);

    return {
      hasUpdate: true,
      categories,
      duas,
      version: newVersion,
    };
  } catch {
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
    const workingUrl = await findWorkingApiUrl();
    if (!workingUrl) {
      return {
        success: false,
        error: 'সার্ভারে সংযোগ করা সম্ভব হয়নি। নিশ্চিত করুন কম্পিউটার ও মোবাইল একই ওয়াইফাই নেটওয়ার্কে রয়েছে এবং পিএইচপি সার্ভার চালু আছে।',
      };
    }

    const syncRes = await fetchWithTimeout(`${workingUrl}/sync.php`, 8000);
    if (!syncRes.ok) {
      return { success: false, error: 'সার্ভার থেকে ডাটা পাওয়া যায়নি।' };
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
      return { success: false, error: 'সার্ভারে কোনো দোয়ার তথ্য পাওয়া যায়নি।' };
    }

    const version = syncData.version || BUNDLED_VERSION;

    await Promise.all([
      AsyncStorage.setItem(CACHED_CATEGORIES_KEY, JSON.stringify(categories)),
      AsyncStorage.setItem(CACHED_DUAS_KEY, JSON.stringify(duas)),
      AsyncStorage.setItem(DATA_VERSION_KEY, String(version)),
      AsyncStorage.setItem(API_URL_KEY, workingUrl),
    ]);

    return {
      success: true,
      categories,
      duas,
      version,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'সার্ভার সিঙ্ক ব্যর্থ হয়েছে। সংযোগ পরীক্ষা করুন।',
    };
  }
}
