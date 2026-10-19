import { Category, Dua } from '../types/dua';

const API_BASE = './api';

export function getAdminToken(): string | null {
  return localStorage.getItem('daily_dua_admin_token');
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem('daily_dua_admin_token', token);
  } else {
    localStorage.removeItem('daily_dua_admin_token');
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchPublicData(): Promise<{
  version: number;
  categories: Category[];
  duas: Dua[];
}> {
  try {
    const res = await fetch(`${API_BASE}/sync.php`);
    if (!res.ok) throw new Error('Failed to fetch data');
    const data = await res.json();
    return {
      version: data.version || 1,
      categories: data.categories || [],
      duas: data.duas || [],
    };
  } catch (err) {
    console.warn('API sync failed, falling back to local fallback data:', err);
    // Fallback directly to json if api is not running
    const catRes = await fetch('./api/data/categories.json').catch(() => null);
    const duaRes = await fetch('./api/data/duas.json').catch(() => null);
    const categories = catRes ? await catRes.json() : [];
    const rawDuas = duaRes ? await duaRes.json() : [];
    const duas = rawDuas.map((d: any) => ({
      ...d,
      categoryIds: d.categoryIds || (d.categoryId ? [d.categoryId] : []),
    }));
    return { version: 1, categories, duas };
  }
}

export async function checkVersion(): Promise<number> {
  const res = await fetch(`${API_BASE}/version.php`);
  const data = await res.json();
  return data.version || 1;
}

// Admin APIs
export async function loginAdmin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/admin/auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    setAdminToken(data.token);
  }
  return data;
}

export async function checkAdminAuth(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/admin/auth.php`, {
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/admin/categories.php`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.categories || [];
}

export async function saveAdminCategory(category: Partial<Category> & { id?: string }, isEdit = false): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/categories.php`, {
    method: isEdit ? 'PUT' : 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  return res.json();
}

export async function deleteAdminCategory(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/categories.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchAdminDuas(categoryId?: string): Promise<Dua[]> {
  const url = categoryId 
    ? `${API_BASE}/admin/duas.php?category_id=${encodeURIComponent(categoryId)}`
    : `${API_BASE}/admin/duas.php`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch duas');
  const data = await res.json();
  return data.duas || [];
}

export async function saveAdminDua(dua: Partial<Dua> & { id?: string }, isEdit = false): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/duas.php`, {
    method: isEdit ? 'PUT' : 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dua),
  });
  return res.json();
}

export async function deleteAdminDua(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/duas.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}
