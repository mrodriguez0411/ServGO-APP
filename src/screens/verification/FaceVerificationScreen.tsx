import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

type FaceVerificationRouteProp = RouteProp<RootStackParamList, 'FaceVerification'>;
type FaceVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'FaceVerification'>;

export default function FaceVerificationScreen() {
  const navigation = useNavigation<FaceVerificationNavigationProp>();
  const route = useRoute<FaceVerificationRouteProp>();
  const { userId } = route.params;
  const theme = useTheme();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const cameraRef = useRef<Camera>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        setError('No se pudo acceder a la cámara');
      }
    })();
  }, []);

  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.torch : FlashMode.off
    );
  };

  const startCountdown = (duration: number = 3) => {
    setCountdown(duration);
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => resolve(), duration * 1000);
    });
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Start countdown
      await startCountdown(3);
      
      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false
      });

      // Process the photo
      console.log('Photo taken:', photo);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On success
      Alert.alert('¡Éxito!', 'La verificación facial se ha completado correctamente.');
      navigation.goBack();
      
    } catch (err) {
      console.error('Error taking picture:', err);
      setError('Error al tomar la foto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openAppSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Necesitamos acceso a la cámara para continuar con la verificación facial.
        </Text>
        <Button mode="contained" onPress={openAppSettings} style={styles.button}>
          Abrir configuración
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {showInstructions && (
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionsTitle}>Instrucciones</Text>
                <Text style={styles.instructionsText}>
                  • Asegúrate de que tu rostro esté bien iluminado
                </Text>
                <Text style={styles.instructionsText}>
                  • Mantén el teléfono a la altura de los ojos
                </Text>
                <Text style={styles.instructionsText}>
                  • Quítate gafas o accesorios que cubran el rostro
                </Text>
                <TouchableOpacity 
                  style={styles.hideInstructionsButton}
                  onPress={() => setShowInstructions(false)}
                >
                  <MaterialIcons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name={flashMode === FlashMode.off ? 'flash-off' : 'flash-on'} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraType}
              disabled={isProcessing}
            >
              <MaterialIcons 
                name="flip-camera-ios" 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>

      {countdown !== null && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.processingText}>Procesando...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={24} color="white" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    padding: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  countdownContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  countdownText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  instructionsContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  hideInstructionsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 18,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
});
        setHasPermission(status === 'granted');
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        setError('No se pudo acceder a la cámara');
      }
    })();
  }, []);

  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.torch : FlashMode.off
    );
  };

  const startCountdown = (duration: number = 3) => {
    setCountdown(duration);
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => resolve(), duration * 1000);
    });
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Start countdown
      await startCountdown(3);
      
      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false
      });

      // Process the photo
      console.log('Photo taken:', photo);
      // TODO: Upload to server and verify face
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On success
      Alert.alert('Success', 'Face verification completed successfully!');
      navigation.goBack();
      
    } catch (err) {
      console.error('Error taking picture:', err);
      setError('Failed to take picture. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  };
      } catch (err) {
        console.error('Error al tomar la foto:', err);
        setError('Error al tomar la foto. Por favor, inténtalo de nuevo.');
      } finally {
        setIsProcessing(false);
      }
    
  ;
  
  const toggleCameraType = () => {
    setCameraType(
      cameraType === CameraType.back ? CameraType.front : CameraType.back
    );
  };
  
  const startFaceVerification = async () => {
    if (isRecording || isProcessing) return;
    
    setShowInstructions(false);
    setError(null);
    
    startCountdown(async () => {
      try {
        setIsProcessing(true);
        
        if (!cameraRef.current) {
          throw new Error('Cámara no disponible');
        }
        
        // Take a photo
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false,
        });
        
        if (!photo.base64) {
          throw new Error('No se pudo capturar la imagen');
        }
        
        // Here you would typically send the photo to your backend for face verification
        // For demo purposes, we'll simulate an API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful verification
        const verificationSuccessful = true; // In a real app, this would come from your API
        
        if (verificationSuccessful) {
          // Move to the next screen (verification pending)
          navigation.replace('VerificationPending', { userId });
        } else {
          throw new Error('No se pudo verificar tu rostro. Asegúrate de que tu cara esté bien iluminada y visible.');
        }
        
      } catch (error) {
        console.error('Face verification error:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Error al verificar tu rostro. Intenta nuevamente.'
        );
        setShowInstructions(true);
      } finally {
        setIsProcessing(false);
      }
    });
  };

  // Open device settings for camera permissions
  const openSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  };
  const navigation = useNavigation<FaceVerificationNavigationProp>();
  const route = useRoute<FaceVerificationRouteProp>();
  const { userId } = route.params;
  const theme = useTheme();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const cameraRef = useRef<Camera>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        const isSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
        if (!isSupported) {
          setError('Tu navegador no soporta la funcionalidad de cámara');
          setHasPermission(false);
          return;
        }
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
        } catch (err) {
          console.log('Error al solicitar permisos de cámara:', err);
          setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
          setHasPermission(false);
        }
      } else {
        try {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
          if (status !== 'granted') {
            setError('Permiso de cámara denegado');
          }
        } catch (err) {
          console.error('Error al solicitar permisos de cámara:', err);
          setError('Error al solicitar permisos de cámara');
          setHasPermission(false);
        }
      }
    })();
  }, []);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  const toggleFlash = () => {
    setFlashMode(flashMode === FlashMode.off ? FlashMode.torch : FlashMode.off);
  };

  const startCountdown = (duration: number = 3) => {
    setCountdown(duration);
    
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          takePicture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false
      });
      
      // Handle the captured photo
      console.log('Photo taken:', photo);
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      const verificationSuccessful = true;
      
      if (verificationSuccessful) {
        navigation.replace('VerificationPending', { userId });
      } else {
        throw new Error('No se pudo verificar tu rostro. Asegúrate de que tu cara esté bien iluminada y visible.');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Error al tomar la foto. Por favor, inténtalo de nuevo.'
      );
      setShowInstructions(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const openSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      {hasPermission === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Verificando permisos de cámara...</Text>
        </View>
      ) : hasPermission === false ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            No se pudo acceder a la cámara. Por favor, verifica los permisos.
          </Text>
          <Button mode="contained" onPress={openSettings} style={styles.button}>
            Abrir configuración
          </Button>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={cameraType}
            ref={cameraRef}
            flashMode={flashMode}
            ratio="16:9"
          >
            <View style={styles.overlay}>
              <View style={styles.controls}>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                  <MaterialIcons name="flip-camera-android" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                  <MaterialIcons
                    name={flashMode === FlashMode.off ? 'flash-off' : 'flash-on'}
                    size={32}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={startFaceVerification}
                  disabled={isProcessing}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                {countdown !== null && (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                  </View>
                )}
              </View>
            </View>
          </Camera>

          {showInstructions && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Coloca tu rostro dentro del marco y toca el botón para tomar la foto.
              </Text>
              <Button
                mode="text"
                onPress={() => setShowInstructions(false)}
                style={styles.hideInstructionsButton}
              >
                Entendido
              </Button>
            </View>
          )}

          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.processingText}>Procesando...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={20} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    padding: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flipButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  flashButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  countdownContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  countdownText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    color: '#fff',
    marginBottom: 15,
  },
  hideInstructionsButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  }
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  instructionsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
    lineHeight: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    color: '#5D4037',
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 8,
  },
  startButtonContent: {
    height: 48,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
});

export default FaceVerificationScreen;
