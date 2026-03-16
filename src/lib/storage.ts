type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T extends Json>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

