import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type VerificationPendingRouteProp = RouteProp<RootStackParamList, 'VerificationPending'>;
type VerificationPendingNavigationProp = StackNavigationProp<RootStackParamList, 'VerificationPending'>;

const CHECK_INTERVAL = 30000; // 30 seconds

export const VerificationPendingScreen = () => {
  const navigation = useNavigation<VerificationPendingNavigationProp>();
  const route = useRoute<VerificationPendingRouteProp>();
  const { userId } = route.params;
  const theme = useTheme();
  const { checkVerificationStatus, user } = useAuth();
  
  // Check verification status periodically
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const checkStatus = async () => {
      try {
        const result = await checkVerificationStatus(userId);
        
        if (result.isVerified) {
          // User is verified, navigate to home or dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };
    
    // Initial check
    checkStatus();
    
    // Set up interval for periodic checks
    intervalId = setInterval(checkStatus, CHECK_INTERVAL);
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userId, navigation]);
  
  const handleContactSupport = () => {
    // In a real app, this would open an email client or chat support
    const supportEmail = 'soporte@servigo.com';
    const subject = 'Soporte de verificación';
    const body = `Hola equipo de Soporte,\n\nNecesito ayuda con mi proceso de verificación.\n\nMi ID de usuario es: ${userId}\n\nGracias.`;
    
    Linking.openURL(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
            <MaterialIcons 
              name="hourglass-empty" 
              size={48} 
              color={theme.colors.primary} 
            />
          </View>
        </View>
        
        <Text style={styles.title}>¡Gracias por completar tu registro!</Text>
        
        <Text style={styles.subtitle}>
          Estamos revisando tu información de verificación. Este proceso puede tomar hasta 24 horas hábiles.
        </Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>Hemos recibido tus documentos</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="verified-user" size={20} color="#2196F3" />
            <Text style={styles.infoText}>Verificando tu identidad</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="notifications-active" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>Te notificaremos cuando todo esté listo</Text>
          </View>
        </View>
        
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb" size={20} color="#FFC107" style={styles.tipIcon} />
          <View>
            <Text style={styles.tipTitle}>¿Qué puedes hacer mientras tanto?</Text>
            <Text style={styles.tipText}>
              Explora la aplicación y descubre cómo funciona. Una vez que tu cuenta esté verificada, podrás comenzar a disfrutar de todos los beneficios.
            </Text>
          </View>
        </View>
        
        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
          </Text>
          <Button
            mode="outlined"
            onPress={handleContactSupport}
            style={styles.contactButton}
            icon="email"
          >
            Contactar a soporte
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
  contactContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    fontSize: 15,
  },
  contactButton: {
    borderRadius: 8,
    borderWidth: 1.5,
  },
});

export default VerificationPendingScreen;
