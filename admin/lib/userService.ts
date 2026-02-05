import { supabase, UserProfile, UserStatus } from './supabase';

/**
 * Obtiene todos los usuarios pendientes de aprobación
 */
export const getPendingUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    throw error;
  }

  return data as UserProfile[];
};

/**
 * Actualiza el estado de un usuario
 */
export const updateUserStatus = async (
  userId: string,
  status: UserStatus,
  rejectionReason?: string
): Promise<UserProfile> => {
  const updateData: Partial<UserProfile> = {
    status,
    updated_at: new Date().toISOString(),
    ...(status === 'approved' && { 
      is_active: true, 
      verification_status: 'verified' 
    }),
    ...(status === 'rejected' && { 
      is_active: false, 
      verification_status: 'rejected',
      rejection_reason: rejectionReason || 'Documentación rechazada',
    }),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estado del usuario:', error);
    throw error;
  }

  return data as UserProfile;
};

/**
 * Obtiene un usuario por su ID
 */
export const getUserById = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }

  return data as UserProfile;
};
