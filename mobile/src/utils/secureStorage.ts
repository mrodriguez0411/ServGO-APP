import * as SecureStore from 'expo-secure-store';

// Mock implementation for web platform
const mockStorage: { [key: string]: string } = {};

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        // Web platform - use localStorage as fallback
        localStorage.setItem(key, value);
      } else {
        // Native platform
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn('SecureStore not available, using fallback:', error);
      mockStorage[key] = value;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        // Web platform - use localStorage as fallback
        return localStorage.getItem(key);
      } else {
        // Native platform
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.warn('SecureStore not available, using fallback:', error);
      return mockStorage[key] || null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
        // Web platform - use localStorage as fallback
        localStorage.removeItem(key);
      } else {
        // Native platform
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn('SecureStore not available, using fallback:', error);
      delete mockStorage[key];
    }
  }
};
