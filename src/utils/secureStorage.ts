import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple storage implementation using AsyncStorage
export const secureStorage = {
  // Get item from storage
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },

  // Set item in storage
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
      throw error;
    }
  },

  // Remove item from storage
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
      throw error;
    }
  },

  // Generate a random string (not cryptographically secure)
  generateSecureKey(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  // Simple hash function (not cryptographically secure)
  async hashString(value: string): Promise<string> {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
};
