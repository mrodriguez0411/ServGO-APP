import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, ActivityIndicator, Card, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
//import * as DocumentPicker from 'expo-document-picker';
//import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type DocumentVerificationRouteProp = RouteProp<RootStackParamList, 'DocumentVerification'>;
type DocumentVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'DocumentVerification'>;

type DocumentType = 'id_front' | 'id_back' | 'selfie';

interface DocumentState {
  uri: string | null;
  loading: boolean;
  error: string | null;
}

export const DocumentVerificationScreen = () => {
  const navigation = useNavigation<DocumentVerificationNavigationProp>();
  const route = useRoute<DocumentVerificationRouteProp>();
  const { userId } = route.params;
  const theme = useTheme();
  
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentState>>({
    id_front: { uri: null, loading: false, error: null },
    id_back: { uri: null, loading: false, error: null },
    selfie: { uri: null, loading: false, error: null },
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { uploadVerificationDocument } = useAuth();
  
  // Request permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisos requeridos',
            'Necesitamos acceso a tu galería para subir documentos.'
          );
        }
        
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert(
            'Permisos de cámara requeridos',
            'Necesitamos acceso a tu cámara para tomar fotos de los documentos.'
          );
        }
      }
    })();
  }, []);
  
  const getDocumentTitle = (type: DocumentType): string => {
    switch (type) {
      case 'id_front':
        return 'Frente de tu INE/IFE';
      case 'id_back':
        return 'Reverso de tu INE/IFE';
      case 'selfie':
        return 'Selfie sosteniendo tu INE/IFE';
      default:
        return '';
    }
  };
  
  const getDocumentDescription = (type: DocumentType): string => {
    switch (type) {
      case 'id_front':
        return 'Toma una foto clara del frente de tu INE/IFE';
      case 'id_back':
        return 'Toma una foto clara del reverso de tu INE/IFE';
      case 'selfie':
        return 'Toma una selfie sosteniendo tu INE/IFE cerca de tu rostro';
      default:
        return '';
    }
  };
  
  const pickImage = async (type: DocumentType) => {
    try {
      // Reset error state
      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], error: null, loading: true }
      }));
      
      let result;
      
      if (type === 'selfie') {
        // For selfie, use camera
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // For ID, allow both camera and gallery
        const action = await new Promise<string>((resolve) => {
          Alert.alert(
            'Seleccionar origen',
            '¿Cómo deseas capturar el documento?',
            [
              { text: 'Cámara', onPress: () => resolve('camera') },
              { text: 'Galería', onPress: () => resolve('gallery') },
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve('cancel') },
            ]
          );
        });
        
        if (action === 'camera') {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });
        } else if (action === 'gallery') {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });
        } else {
          throw new Error('Selección cancelada');
        }
      }
      
      if (result.canceled) {
        throw new Error('Selección cancelada');
      }
      
      if (!result.assets || result.assets.length === 0) {
        throw new Error('No se pudo cargar la imagen');
      }
      
      const asset = result.assets[0];
      
      // Update local state with the new image
      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], uri: asset.uri, loading: false }
      }));
      
    } catch (error) {
      console.error(`Error picking image for ${type}:`, error);
      setDocuments(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          error: error instanceof Error ? error.message : 'Error al seleccionar la imagen',
          loading: false 
        }
      }));
    }
  };
  
  const removeImage = (type: DocumentType) => {
    setDocuments(prev => ({
      ...prev,
      [type]: { uri: null, loading: false, error: null }
    }));
  };
  
  const handleSubmit = async () => {
    // Check if all required documents are uploaded
    const missingDocs = Object.entries(documents)
      .filter(([_, doc]) => !doc.uri)
      .map(([type]) => getDocumentTitle(type as DocumentType));
    
    if (missingDocs.length > 0) {
      Alert.alert(
        'Documentos faltantes',
        `Por favor sube los siguientes documentos: ${missingDocs.join(', ')}`
      );
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload each document
      const uploadPromises = Object.entries(documents).map(async ([type, doc]) => {
        if (!doc.uri) return;
        
        const result = await uploadVerificationDocument(
          userId,
          type as DocumentType,
          doc.uri
        );
        
        if (!result.success) {
          throw new Error(result.error || `Error al subir ${getDocumentTitle(type as DocumentType)}`);
        }
        
        return result.documentId;
      });
      
      await Promise.all(uploadPromises);
      
      // Move to the next verification step (face verification)
      navigation.replace('FaceVerification', { userId });
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al subir los documentos. Intenta nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const allDocumentsUploaded = Object.values(documents).every(doc => doc.uri);
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Verificación de identidad</Text>
        <Text style={styles.subtitle}>
          Para completar tu registro, necesitamos verificar tu identidad. Sube fotos claras de los siguientes documentos:
        </Text>
        
        {Object.entries(documents).map(([type, doc]) => (
          <Card key={type} style={[styles.card, doc.error ? styles.cardError : null]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{getDocumentTitle(type as DocumentType)}</Text>
                {doc.uri && (
                  <Button 
                    mode="text" 
                    onPress={() => removeImage(type as DocumentType)}
                    compact
                    style={styles.removeButton}
                    labelStyle={styles.removeButtonLabel}
                  >
                    Cambiar
                  </Button>
                )}
              </View>
              
              <Text style={styles.cardDescription}>
                {getDocumentDescription(type as DocumentType)}
              </Text>
              
              {doc.loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Cargando...</Text>
                </View>
              ) : doc.uri ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: doc.uri }} 
                    style={styles.image} 
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => pickImage(type as DocumentType)}
                  style={styles.uploadButton}
                  icon="camera"
                >
                  {type === 'selfie' ? 'Tomar selfie' : 'Subir imagen'}
                </Button>
              )}
              
              {doc.error && (
                <Text style={styles.errorText}>
                  <MaterialIcons name="error" size={16} color={theme.colors.error} /> {doc.error}
                </Text>
              )}
            </Card.Content>
          </Card>
        ))}
        
        <View style={styles.noteContainer}>
          <MaterialIcons name="info" size={20} color="#666" style={styles.noteIcon} />
          <Text style={styles.noteText}>
            Tus documentos se enviarán de forma segura y solo se utilizarán para verificar tu identidad.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!allDocumentsUploaded || submitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Continuar con verificación facial
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for the fixed button
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardError: {
    borderWidth: 1,
    borderColor: '#f44336',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  removeButton: {
    marginLeft: 8,
  },
  removeButtonLabel: {
    fontSize: 14,
  },
  uploadButton: {
    marginTop: 8,
    borderStyle: 'dashed',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  imageContainer: {
    height: 200,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: '#f44336',
    fontSize: 13,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    color: '#0d47a1',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 4,
  },
  submitButton: {
    borderRadius: 8,
  },
  submitButtonContent: {
    height: 48,
  },
});

export default DocumentVerificationScreen;
