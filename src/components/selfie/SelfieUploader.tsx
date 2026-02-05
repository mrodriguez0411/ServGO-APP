import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import SelfieCapture from './SelfieCapture';
import { supabase } from '../../lib/supabase';
import { uploadDocument } from '../../services/documentService';

interface SelfieUploaderProps {
  userId: string;
  onSuccess: (selfieUrl: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  errorMessage?: string;
  maxFileSize?: number; // en bytes
  allowedTypes?: string[];
  aspectRatio?: [number, number];
  quality?: number;
}

const SelfieUploader: React.FC<SelfieUploaderProps> = ({
  userId,
  onSuccess,
  onCancel,
  title = 'Verificación de identidad',
  description = 'Toma una selfie clara donde se vea bien tu rostro',
  buttonText = 'Tomar selfie',
  successMessage = '¡Selfie cargada exitosamente!',
  errorMessage = 'Error al cargar la selfie. Por favor, inténtalo de nuevo.',
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
  aspectRatio = [4, 3],
  quality = 0.8,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validar el tipo de archivo
  const validateFileType = (uri: string, type: string): boolean => {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeType = type.toLowerCase();
    
    return (
      allowedTypes.includes(mimeType) ||
      (extension === 'jpg' && allowedTypes.includes('image/jpeg')) ||
      (extension === 'jpeg' && allowedTypes.includes('image/jpeg')) ||
      (extension === 'png' && allowedTypes.includes('image/png'))
    );
  };

  // Validar el tamaño del archivo
  const validateFileSize = (fileSize: number): boolean => {
    return fileSize <= maxFileSize;
  };

  // Subir la selfie a Supabase Storage
  const uploadSelfie = async (uri: string, type: string, fileName: string) => {
    try {
      setIsUploading(true);
      setError(null);

      // Obtener información del archivo
      const fileInfo = await getFileInfo(uri);
      
      // Validar tipo de archivo
      if (!validateFileType(uri, type)) {
        throw new Error('Tipo de archivo no soportado. Usa JPG o PNG.');
      }

      // Validar tamaño del archivo
      if (!validateFileSize(fileInfo.size)) {
        throw new Error(`El archivo es demasiado grande. El tamaño máximo permitido es ${maxFileSize / (1024 * 1024)}MB`);
      }

      // Crear un nombre único para el archivo
      const fileExt = fileName.split('.').pop();
      const filePath = `users/${userId}/selfies/selfie_${Date.now()}.${fileExt}`;

      // Convertir la URI a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: type,
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

      // Éxito
      Alert.alert('¡Éxito!', successMessage);
      onSuccess(urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error en uploadSelfie:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

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

  // Manejar la captura de la selfie
  const handleSelfieCapture = async (uri: string) => {
    try {
      const fileName = `selfie_${userId}_${Date.now()}.jpg`;
      const fileType = 'image/jpeg';
      
      // Subir la selfie
      const selfieUrl = await uploadSelfie(uri, fileType, fileName);
      
      // onSuccess se llama automáticamente desde uploadSelfie
      return selfieUrl;
    } catch (err) {
      console.error('Error en handleSelfieCapture:', err);
      setError('Error al procesar la selfie');
      throw err;
    }
  };

  if (isUploading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SelfieCapture
        onCapture={handleSelfieCapture}
        onCancel={onCancel}
        title={title}
        description={description}
        buttonText={buttonText}
        aspectRatio={aspectRatio}
        quality={quality}
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8,
    margin: 10,
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
});

export default SelfieUploader;
