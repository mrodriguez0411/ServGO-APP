import React, { useEffect, useState } from 'react';
import { 
  Image, 
  ImageBackground, 
  StyleSheet, 
  View, 
  ViewStyle, 
  ImageSourcePropType, 
  Text, 
  ActivityIndicator,
  StyleProp,
  ImageStyle,
  Platform,
  ColorValue
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';

interface BackgroundImageProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  source?: ImageSourcePropType;
  overlayColor?: string | string[];
  blurIntensity?: number;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ 
  children, 
  style,
  imageStyle,
  source = require('../../../assets/prevlogin.png'),
  overlayColor = ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.6)'],
  blurIntensity = 0,
  loadingFallback,
  errorFallback
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const theme = useTheme();
  const isGradient = Array.isArray(overlayColor);

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      try {
        if (!source) {
          if (isMounted) setImageLoaded(true);
          return;
        }

        if (typeof source === 'number' || (source as any).uri) {
          // Para imágenes locales (require) o remotas (URI)
          if (isMounted) setImageLoaded(true);
        } else {
          console.warn('Unsupported source type:', source);
          if (isMounted) setImageError('Tipo de fuente de imagen no soportado');
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setImageError('Error al cargar la imagen: ' + (error as Error).message);
        }
      }
    };

    loadImage();
    return () => { isMounted = false; };
  }, [source]);

  const renderOverlay = () => {
    if (!overlayColor) return null;
    
    if (isGradient) {
      return (
        <LinearGradient
          colors={overlayColor as string[]}
          style={[StyleSheet.absoluteFill, styles.overlay]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      );
    }
    
    return (
      <View 
        style={[
          StyleSheet.absoluteFill, 
          styles.overlay, 
          { backgroundColor: overlayColor as string }
        ]} 
      />
    );
  };

  const renderContent = () => {
    if (imageError) {
      return errorFallback || (
        <View style={[styles.fallbackContainer, { backgroundColor: '#0ea5a3' }]}>
          <Text style={[styles.errorText, { color: 'white' }]}>
            No se pudo cargar la imagen de fondo
          </Text>
        </View>
      );
    }

    if (!imageLoaded) {
      return loadingFallback || (
        <View style={[styles.fallbackContainer, { backgroundColor: '#0ea5a3' }]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      );
    }

    return (
      <ImageBackground
        source={source}
        style={[styles.container, imageStyle]}
        resizeMode="cover"
        onError={() => setImageError('Error al cargar la imagen')}
        onLoadEnd={() => setImageLoaded(true)}
      >
        {overlayColor && renderOverlay()}
        {blurIntensity > 0 && Platform.OS === 'ios' ? (
          <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFill}>
            {children}
          </BlurView>
        ) : (
          children
        )}
      </ImageBackground>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ImageBackground
        source={source}
        style={[styles.backgroundImage, imageStyle]}
        resizeMode="cover"
        onError={() => setImageError('Error al cargar la imagen')}
        onLoadEnd={() => setImageLoaded(true)}
      >
        {overlayColor && renderOverlay()}
        {blurIntensity > 0 && Platform.OS === 'ios' ? (
          <BlurView intensity={blurIntensity} style={StyleSheet.absoluteFill}>
            <View style={styles.content}>
              {children}
            </View>
          </BlurView>
        ) : (
          <View style={styles.content}>
            {children}
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0ea5a3', // Color de fondo por defecto
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 10, // Reducir la opacidad para mayor transparencia
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0ea5a3',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
});

export default BackgroundImage;
