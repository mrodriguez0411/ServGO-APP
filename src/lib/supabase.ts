/*import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { createClient } from '@supabase/supabase-js'

// Read config from Expo extra
const SUPABASE_URL = (Constants?.expoConfig?.extra as any)?.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = (Constants?.expoConfig?.extra as any)?.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY in app.config.js -> expo.extra')
}

// Use AsyncStorage for auth persistence on React Native
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default supabase*/

import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase configuration
const SUPABASE_URL = 'https://aozmhlermrhlikcwjgeo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvem1obGVybXJobGlrY3dqZ2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDk1ODMsImV4cCI6MjA3NjAyNTU4M30.CGQBo5ErG2ga9UinqhXXfC3COu0mWPerVITMhMJJBFk';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your configuration.');
}

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
