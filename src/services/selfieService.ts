import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { uploadDocument, DocumentoTipo } from './documentService';
import { Alert, Platform } from 'react-native';

type SelfieOptions = {
  title?: string;
  message?: string;
  cancelText?: string;
  takePhotoButtonText?: string;
  chooseFromLibraryButtonText?: string;
};

export const requestSelfie = async (
  userId: string,
  options: SelfieOptions = {}
): Promise<{ success: boolean; error?: string }> => {
  const {
    title = 'Verificación de identidad',
    message = 'Para completar tu registro, necesitamos una selfie tuya',
    cancelText = 'Cancelar',
    takePhotoButtonText = 'Tomar foto',
    chooseFromLibraryButtonText = 'Elegir de la galería',
  } = options;

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: () => resolve({ success: false, error: 'User cancelled' }),
        },
        {
          text: takePhotoButtonText,
          onPress: () => handleSelfieCapture(userId, 'capture').then(resolve).catch(error => 
            resolve({ success: false, error: error.message })
          ),
        },
        {
          text: chooseFromLibraryButtonText,
          onPress: () => handleSelfieCapture(userId, 'library').then(resolve).catch(error =>
            resolve({ success: false, error: error.message })
          ),
        },
      ],
      { cancelable: false }
    );
  });
};

const handleSelfieCapture = async (
  userId: string,
  source: 'capture' | 'library'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: false,
      cameraType: 'front' as const,
    };

    const response: ImagePickerResponse = await (source === 'capture'
      ? launchCamera(options)
      : launchImageLibrary(options));

    if (response.didCancel) {
      return { success: false, error: 'User cancelled' };
    }

    if (response.errorCode) {
      console.error('ImagePicker Error: ', response.errorMessage);
      return { success: false, error: response.errorMessage || 'Error al capturar la imagen' };
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      return { success: false, error: 'No se pudo obtener la imagen' };
    }

    // Upload the selfie
    await uploadDocument({
      user_id: userId,
      tipo: 'selfie',
      file: {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        fileName: `selfie_${userId}_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      },
      estado: 'pending',
    });

    return { success: true };
  } catch (error) {
    console.error('Error en handleSelfieCapture:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función para verificar si el usuario ya subió una selfie
export const hasUserUploadedSelfie = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('id')
      .eq('user_id', userId)
      .eq('tipo', 'selfie')
      .eq('estado', 'approved')
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error verificando selfie del usuario:', error);
    return false;
  }
};

// Función para verificar la calidad de la selfie (puedes implementar lógica más avanzada)
export const verifySelfieQuality = async (imageUri: string): Promise<{ valid: boolean; message?: string }> => {
  // Aquí puedes implementar lógica para verificar la calidad de la imagen
  // Por ahora, solo verificamos que la imagen exista
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUri;
    
    img.onload = () => {
      // Verificar dimensiones mínimas
      if (img.width < 500 || img.height < 500) {
        resolve({ 
          valid: false, 
          message: 'La imagen es demasiado pequeña. Por favor, acércate más a la cámara.' 
        });
        return;
      }
      
      // Verificar relación de aspecto (aproximadamente cuadrada)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.7 || aspectRatio > 1.3) {
        resolve({
          valid: false,
          message: 'La imagen debe ser aproximadamente cuadrada. Por favor, ajusta el encuadre.'
        });
        return;
      }
      
      resolve({ valid: true });
    };
    
    img.onerror = () => {
      resolve({ valid: false, message: 'No se pudo cargar la imagen. Intenta de nuevo.' });
    };
  });
};
