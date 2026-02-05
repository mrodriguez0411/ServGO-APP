import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Tipos de usuario
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  user_type: 'client' | 'provider';
  status: UserStatus;
  created_at: string;
  updated_at: string;
  profession?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  dni_front_url?: string;
  dni_back_url?: string;
  rejection_reason?: string;
}
