import React from 'react';
import { StyleSheet, View, ViewStyle, Text, Image } from 'react-native';

interface FlagProps {
  countryCode: string;
  size?: number;
  style?: ViewStyle;
}

const Flag: React.FC<FlagProps> = ({ countryCode, size = 24, style }) => {
  // Convertir a minúsculas y manejar códigos especiales
  const normalizedCode = countryCode.toLowerCase();
  
  // Mapear códigos de país no estándar
  const countryCodeMap: Record<string, string> = {
    'uk': 'gb', // Reino Unido
    'do': 'do', // República Dominicana
    // Agregar más mapeos si es necesario
  };

  const code = countryCodeMap[normalizedCode] || normalizedCode;
  
  // Usar flagcdn.com que proporciona banderas en PNG
  const flagUri = `https://flagcdn.com/w80/${code}.png`;
  
  // Usar ImageStyle ya que es para un componente Image
  const imageStyle = {
    width: size * 1.5,
    height: size,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    overflow: 'hidden' as const, // Asegurar que sea un valor literal
  };
  
  const containerStyle: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
  };

  try {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: flagUri }}
          style={imageStyle}
          resizeMode="cover"
        />
      </View>
    );
  } catch (e) {
    console.warn(`No se pudo cargar la bandera para: ${countryCode}`, e);
    // Mostrar un marcador de posición si la bandera no se encuentra
    return (
      <View style={[styles.container, containerStyle, style]}>
        <View style={styles.unknownFlag}>
          <Text style={styles.unknownFlagText}>
            {countryCode.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  unknownFlag: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  unknownFlagText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Flag;
