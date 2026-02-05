import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { uploadDocument } from '../services/documentService';

interface UseSelfieUploadProps {
  userId: string;
  onSuccess?: (selfieUrl: string) => void;
  onError?: (error: Error) => void;
}

const useSelfieUpload = ({ userId, onSuccess, onError }: UseSelfieUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  // Subir la selfie a Supabase Storage
  const uploadSelfie = useCallback(async (file: { uri: string; type: string; name: string }) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.some(type => file.type.includes(type))) {
        throw new Error('Tipo de archivo no soportado. Usa JPG o PNG.');
      }

      // Validar tamaño del archivo (5MB máximo)
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const fileInfo = await getFileInfo(file.uri);
      if (fileInfo.size > maxFileSize) {
        throw new Error(`El archivo es demasiado grande. El tamaño máximo permitido es ${maxFileSize / (1024 * 1024)}MB`);
      }

      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const filePath = `users/${userId}/selfies/selfie_${Date.now()}.${fileExt}`;

      // Convertir la URI a blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Error al subir la selfie:', uploadError);
        throw new Error('Error al subir la selfie a nuestro servidor');
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      // Guardar referencia en la base de datos
      const { error: dbError } = await uploadDocument({
        user_id: userId,
        tipo: 'selfie',
        url: urlData.publicUrl,
        estado: 'pending',
      });

      if (dbError) {
        console.error('Error al guardar la selfie en la base de datos:', dbError);
        throw new Error('Error al guardar la selfie');
      }

      setSelfieUrl(urlData.publicUrl);
      onSuccess?.(urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error en uploadSelfie:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [userId, onSuccess, onError]);

  // Obtener información del archivo
  const getFileInfo = async (uri: string): Promise<{ size: number; type: string }> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return {
        size: blob.size,
        type: blob.type,
      };
    } catch (err) {
      console.error('Error al obtener información del archivo:', err);
      throw new Error('No se pudo obtener información del archivo');
    }
  };

  // Verificar si el usuario ya tiene una selfie
  const hasSelfie = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('id')
        .eq('user_id', userId)
        .eq('tipo', 'selfie')
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (err) {
      console.error('Error al verificar selfie existente:', err);
      return false;
    }
  }, [userId]);

  // Obtener la URL de la selfie del usuario
  const getSelfieUrl = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('url')
        .eq('user_id', userId)
        .eq('tipo', 'selfie')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.url || null;
    } catch (err) {
      console.error('Error al obtener la URL de la selfie:', err);
      return null;
    }
  }, [userId]);

  // Eliminar la selfie del usuario
  const deleteSelfie = useCallback(async (): Promise<boolean> => {
    try {
      // Obtener la ruta del archivo en el almacenamiento
      const { data: documents, error: findError } = await supabase
        .from('documentos')
        .select('id, url')
        .eq('user_id', userId)
        .eq('tipo', 'selfie');

      if (findError) throw findError;

      // Eliminar de la base de datos
      const { error: deleteError } = await supabase
        .from('documentos')
        .delete()
        .eq('user_id', userId)
        .eq('tipo', 'selfie');

      if (deleteError) throw deleteError;

      // Eliminar del almacenamiento
      if (documents && documents.length > 0) {
        const filePath = documents[0].url.split('/user-documents/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('user-documents')
            .remove([filePath]);

          if (storageError) {
            console.error('Error al eliminar el archivo del almacenamiento:', storageError);
            // No lanzamos el error aquí para no revertir la eliminación de la base de datos
          }
        }
      }

      setSelfieUrl(null);
      return true;
    } catch (err) {
      console.error('Error al eliminar la selfie:', err);
      return false;
    }
  }, [userId]);

  return {
    uploadSelfie,
    hasSelfie,
    getSelfieUrl,
    deleteSelfie,
    isUploading,
    error,
    selfieUrl,
  };
};

export default useSelfieUpload;
