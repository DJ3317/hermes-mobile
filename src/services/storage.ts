/**
 * 持久化存储工具 — 基于 AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'hermes:';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn(`Storage set failed for "${key}":`, err);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${PREFIX}${key}`);
    } catch (err) {
      console.warn(`Storage remove failed for "${key}":`, err);
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const hermesKeys = keys.filter((k) => k.startsWith(PREFIX));
      if (hermesKeys.length > 0) {
        await AsyncStorage.multiRemove(hermesKeys);
      }
    } catch (err) {
      console.warn('Storage clear failed:', err);
    }
  },
};
