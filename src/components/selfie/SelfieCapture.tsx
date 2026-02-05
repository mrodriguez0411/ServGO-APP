import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Platform, Text, ActivityIndicator, Dimensions } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type SelfieCaptureProps = {
  onCapture: (uri: string) => Promise<void>;
  onCancel: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  retakeText?: string;
  cancelText?: string;
  flashOnText?: string;
  flashOffText?: string;
  flipText?: string;
  loadingText?: string;
  errorText?: string;
  aspectRatio?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  buttonIcon?: keyof typeof Ionicons.glyphMap;
  buttonStyle?: object;
  buttonTextStyle?: object;
  containerStyle?: object;
  cameraStyle?: object;
  previewStyle?: object;
  overlayStyle?: object;
  showControls?: boolean;
  showPreview?: boolean;
  showCancel?: boolean;
  showFlash?: boolean;
  showFlip?: boolean;
  showLoading?: boolean;
  showError?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SelfieCapture: React.FC<SelfieCaptureProps> = ({
  onCapture,
  onCancel,
  title = 'Toma una selfie',
  description = 'Asegúrate de que tu rostro sea claramente visible y esté bien iluminado',
  buttonText = 'Tomar foto',
  retakeText = 'Volver a tomar',
  cancelText = 'Cancelar',
  flashOnText = 'Flash encendido',
  flashOffText = 'Flash apagado',
  flipText = 'Cambiar cámara',
  loadingText = 'Procesando...',
  errorText = 'Error al procesar la imagen. Por favor, inténtalo de nuevo.',
  aspectRatio = [4, 3],
  quality = 0.8,
  maxWidth = 1200,
  maxHeight = 1600,
  buttonIcon = 'camera',
  buttonStyle,
  buttonTextStyle,
  containerStyle,
  cameraStyle,
  previewStyle,
  overlayStyle,
  showControls = true,
  showPreview = true,
  showCancel = true,
  showFlash = true,
  showFlip = true,
  showLoading = true,
  showError = true,
  showTitle = true,
  showDescription = true,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Solicitar permisos al montar el componente
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Solicitar permiso para la galería
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  // Manejar el cambio de cámara (frontal/trasera)
  const handleFlipCamera = () => {
    setCameraType(
      cameraType === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  // Alternar flash
  const toggleFlash = () => {
    setFlashMode(
      flashMode === FlashMode.off ? FlashMode.torch : FlashMode.off
    );
  };

  // Tomar una foto
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        setError(null);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality,
          base64: false,
          exif: false,
          skipProcessing: true,
        });

        // Procesar la imagen si es necesario
        const processedUri = await processImage(photo.uri);
        setCapturedImage(processedUri);
      } catch (err) {
        console.error('Error al tomar la foto:', err);
        setError('Error al capturar la imagen');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Procesar la imagen (redimensionar, etc.)
  const processImage = async (uri: string): Promise<string> => {
    // Aquí podrías añadir lógica adicional de procesamiento de imagen si es necesario
    return uri;
  };

  // Seleccionar una imagen de la galería
  const pickImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const processedUri = await processImage(result.assets[0].uri);
        setCapturedImage(processedUri);
      }
    } catch (err) {
      console.error('Error al seleccionar la imagen:', err);
      setError('Error al seleccionar la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar el uso de la selfie
  const confirmSelfie = async () => {
    if (capturedImage) {
      try {
        setIsLoading(true);
        setError(null);
        await onCapture(capturedImage);
      } catch (err) {
        console.error('Error al confirmar la selfie:', err);
        setError(errorText);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Volver a tomar la foto
  const retakePicture = () => {
    setCapturedImage(null);
    setError(null);
  };

  // Si no se han otorgado los permisos
  if (hasPermission === null) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  // Si no se otorgaron los permisos
  if (hasPermission === false) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Ionicons name="camera-off" size={50} color="#ff3b30" />
        <Text style={styles.text}>No se otorgaron permisos de cámara</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Seleccionar de la galería</Text>
        </TouchableOpacity>
        {showCancel && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Si hay una imagen capturada, mostrar vista previa
  if (capturedImage && showPreview) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Image 
          source={{ uri: capturedImage }} 
          style={[styles.preview, previewStyle]} 
          resizeMode="contain"
        />
        
        <View style={[styles.overlay, overlayStyle]}>
          {showTitle && <Text style={styles.title}>{title}</Text>}
          {showDescription && <Text style={styles.description}>Revisa tu selfie</Text>}
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton, buttonStyle]}
              onPress={confirmSelfie}
              disabled={isLoading}
            >
              {isLoading && showLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, buttonTextStyle]}>
                  {isLoading && showLoading ? loadingText : 'Usar esta foto'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={retakePicture}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>{retakeText}</Text>
            </TouchableOpacity>
            
            {showCancel && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {error && showError && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={20} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Vista de la cámara
  return (
    <View style={[styles.container, containerStyle]}>
      <Camera
        ref={cameraRef}
        style={[styles.camera, cameraStyle]}
        type={cameraType}
        ratio={`${aspectRatio[0]}:${aspectRatio[1]}`}
        flashMode={flashMode}
      >
        <View style={[styles.overlay, overlayStyle]}>
          {showTitle && <Text style={styles.title}>{title}</Text>}
          {showDescription && <Text style={styles.description}>{description}</Text>}
          
          <View style={styles.cameraControls}>
            {showFlash && (
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={toggleFlash}
                disabled={isLoading}
              >
                <Ionicons 
                  name={flashMode === FlashMode.off ? 'flash-off' : 'flash'}
                  size={28} 
                  color="#fff" 
                />
                <Text style={styles.controlButtonText}>
                  {flashMode === FlashMode.off ? flashOffText : flashOnText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.captureButton, buttonStyle]}
              onPress={takePicture}
              disabled={isLoading}
            >
              <Ionicons 
                name={buttonIcon as keyof typeof Ionicons.glyphMap} 
                size={36} 
                color="#fff" 
              />
              {buttonText && (
                <Text style={[styles.buttonText, buttonTextStyle]}>
                  {buttonText}
                </Text>
              )}
            </TouchableOpacity>
            
            {showFlip && (
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleFlipCamera}
                disabled={isLoading}
              >
                <Ionicons name="camera-reverse" size={28} color="#fff" />
                <Text style={styles.controlButtonText}>{flipText}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Ionicons name="images" size={28} color="#fff" />
              <Text style={styles.controlButtonText}>Galería</Text>
            </TouchableOpacity>
            
            {showCancel && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Ionicons name="close" size={28} color="#fff" />
                <Text style={styles.controlButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isLoading && showLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          )}
          
          {error && showError && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={20} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  preview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    marginHorizontal: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  galleryButton: {
    alignItems: 'center',
    padding: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#ff3b30',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default SelfieCapture;
