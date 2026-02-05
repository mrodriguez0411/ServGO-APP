import { supabase } from '../lib/supabase';
import { Asset } from 'react-native-image-picker';

const BUCKET_NAME = 'user-documents';

export type DocumentoTipo = 'id_front' | 'id_back' | 'selfie' | 'certification' | 'other';

export interface Documento {
  id?: string;
  user_id: string;
  tipo: DocumentoTipo;
  url: string;
  file?: Asset; // Archivo a subir (opcional)
  estado?: 'pending' | 'approved' | 'rejected';
  rechazo_motivo?: string;
  subido_en?: string;
  revisado_en?: string;
  revisado_por?: string;
  fecha_creacion?: string;
}

/**
 * Sube un archivo al bucket de almacenamiento
 */
export const uploadFileToStorage = async (file: Asset, path: string) => {
  if (!file.uri || !file.type) {
    throw new Error('Archivo inválido: falta URI o tipo');
  }

  const fileExt = file.uri.split('.').pop();
  const fileName = `${path}/${Date.now()}.${fileExt}`;
  
  // Para React Native, necesitamos usar fetch para obtener el archivo
  const response = await fetch(file.uri);
  const blob = await response.blob();
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: file.type,
    });

  if (error) {
    console.error('Error al subir archivo al almacenamiento:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return { path: data.path, publicUrl };
};

/**
 * Sube un documento a la tabla de documentos
 */
export const uploadDocument = async (documento: Omit<Documento, 'id' | 'fecha_creacion'>) => {
  // Si se proporciona un archivo, subirlo primero al almacenamiento
  if (documento.file) {
    try {
      const { publicUrl } = await uploadFileToStorage(documento.file, `user_${documento.user_id}`);
      documento.url = publicUrl;
      delete documento.file; // Eliminar el archivo del objeto documento
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw new Error('No se pudo subir el archivo al almacenamiento');
    }
  }

  const { data, error } = await supabase
    .from('documentos')
    .insert([documento])
    .select()
    .single();

  if (error) {
    console.error('Error al guardar documento en la base de datos:', error);
    throw error;
  }

  return data || [];
};

/**
 * Obtiene los documentos de un usuario
 */
export const getUserDocuments = async (userId: string): Promise<Documento[]> => {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('user_id', userId)
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error al obtener documentos:', error);
    throw error;
  }

  return data || [];
};

/**
 * Actualiza el estado de un documento
 */
export const updateDocumentStatus = async (
  documentId: string, 
  updates: { 
    estado: 'pending' | 'approved' | 'rejected';
    rechazo_motivo?: string;
  }
) => {
  const { data, error } = await supabase
    .from('documentos')
    .update({
      ...updates,
      revisado_en: new Date().toISOString(),
      revisado_por: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar documento:', error);
    throw error;
  }

  return data || [];
};
