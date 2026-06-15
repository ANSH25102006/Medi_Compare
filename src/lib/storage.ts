/**
 * Safe utility wrapper for browser-only localStorage access.
 * Checks for SSR environment (typeof window !== "undefined") and handles malformed JSON safely.
 */

export function getItemSafe<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === "undefined") {
      return defaultValue;
    }
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[Storage Utility] Failed to parse localStorage key "${key}". Returning default.`, error);
    return defaultValue;
  }
}

export function setItemSafe<T>(key: string, value: T): void {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`[Storage Utility] Failed to write localStorage key "${key}":`, error);
  }
}

export function removeItemSafe(key: string): void {
  try {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage Utility] Failed to remove localStorage key "${key}":`, error);
  }
}
