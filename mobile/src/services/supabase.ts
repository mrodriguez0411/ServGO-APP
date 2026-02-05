// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Obtener las variables de entorno
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'No se encontraron las variables de configuración de Supabase. Asegúrate de configurar EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Tipos de tablas (opcional pero recomendado)
export type Tables = {
  users: any; // Reemplaza 'any' con la interfaz de tu tabla de usuarios
  services: any;
  service_offers: any;
  notifications: any;
  // Agrega más tablas según sea necesario
};

// Tipos de base de datos
export type Database = {
  public: {
    Tables: {
      [K in keyof Tables]: {
        Row: Tables[K];
        Insert: Omit<Tables[K], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Tables[K]>;
      };
    };
  };
};