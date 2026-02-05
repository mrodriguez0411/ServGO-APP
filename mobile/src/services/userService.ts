import { supabase } from '../lib/supabase';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  telefono: string;
  tipo: 'client' | 'provider';
  estado: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_step?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Dirección como objeto JSON
  direccion?: {
    calle: string;
    numero?: string;
    piso?: string;
    departamento?: string;
    codigoPostal: string;
    ciudad: string;
    provincia: string;
    pais: string;
  } | null;
  // Otros campos
  foto?: string | null;
  is_admin?: boolean;
  last_verification_attempt?: string | null;
  phone_verified?: boolean;
  phone_verified_at?: string | null;
  motivo_rechazo?: string;
}

/**
 * Crea un nuevo perfil de usuario en la base de datos
 */
export const createUserProfile = async (userId: string, userData: Partial<UserProfile>) => {
  const now = new Date().toISOString();
  
  const profileData = {
    id: userId,
    email: userData.email,
    nombre: userData.nombre,
    telefono: userData.telefono,
    tipo: userData.tipo || 'client',
    // Dirección como objeto JSON
    direccion: userData.direccion || null,
    // Estado de la cuenta
    estado: userData.estado || 'pending',
    is_active: userData.is_active ?? false,
    is_verified: userData.is_verified ?? false,
    verification_status: userData.verification_status || 'pending',
    verification_step: userData.verification_step || 'phone',
    // Metadatos
    fecha_creacion: now,
    fecha_actualizacion: now,
    // Otros campos
    foto: userData.foto || null,
    is_admin: userData.is_admin ?? false,
    phone_verified: userData.phone_verified ?? false,
    phone_verified_at: userData.phone_verified_at || null,
    last_verification_attempt: userData.last_verification_attempt || null
  };

  const { data, error } = await supabase
    .from('usuarios')
    .insert([profileData])
    .select()
    .single();

  if (error) {
    console.error('Error al crear el perfil del usuario:', error);
    throw error;
  }

  return data;
};

/**
 * Actualiza el estado de aprobación de un usuario
 */
export const updateUserStatus = async (
  userId: string, 
  status: UserStatus, 
  rejectionReason?: string
) => {
  const updateData: Partial<UserProfile> = {
    estado: status,
    fecha_actualizacion: new Date().toISOString(),
    ...(status === 'approved' ? {
      is_active: true,
      is_verified: true,
      verification_status: 'verified' as const,
      motivo_rechazo: undefined
    } : {}),
    ...(status === 'rejected' ? {
      is_active: false,
      is_verified: false,
      verification_status: 'rejected' as const,
      motivo_rechazo: rejectionReason || 'Documentación rechazada'
    } : {}),
  };

  const { data, error } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    throw error;
  }

  return data;
};

/**
 * Obtiene todos los usuarios pendientes de aprobación
 */
export const getPendingUsers = async () => {
  const { data, error } = await supabase
    .from('usuarios')  // Cambiado de 'profiles' a 'usuarios'
    .select('*')
    .eq('estado', 'pending')  // Cambiado de 'status' a 'estado' para coincidir con el esquema
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    throw error;
  }

  return data as UserProfile[];
};

/**
 * Obtiene un perfil de usuario por su ID
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('usuarios')  // Cambiado de 'profiles' a 'usuarios'
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }

  return data as UserProfile;
};

/**
 * Sube un archivo al bucket de almacenamiento de Supabase
 */
export const uploadFile = async (fileUri: string, path: string, fileName: string) => {
  const formData = new FormData();
  const fileType = fileUri.split('.').pop();
  const file = {
    uri: fileUri,
    name: `${fileName}.${fileType}`,
    type: `image/${fileType}`,
  };
  
  formData.append('file', file as any);

  const { data, error } = await supabase.storage
    .from('user-documents')
    .upload(`${path}/${fileName}.${fileType}`, formData as any, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }

  // Obtener la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from('user-documents')
    .getPublicUrl(data.path);

  return publicUrl;
};
